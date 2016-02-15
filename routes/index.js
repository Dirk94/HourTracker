var express = require("express");
var router = express.Router();
var flow = require("flow");

var middleware = require("../helpers/middleware.js");
var UserModel = require("../models/UserModel.js");
var ProjectModel = require("../models/ProjectModel.js");
var HourModel = require("../models/HourModel.js");

router.get("/", function(req, res, next) {
    res.render("index");
});

router.get("/register", function(req, res, next) {
    res.render("register");
});

router.get("/login", function(req, res, next) {
    res.render("login");
});

router.get("/user/home", middleware.auth, function(req, res, next) {
    flow.exec(
        function() {
            UserModel.getUser(req.db, req.session.userid, this.MULTI("user"));
            ProjectModel.getCreatedProjects(req.db, req.session, this.MULTI("created"));
            ProjectModel.getAddedProjects(req.db, req.session, this.MULTI("added"));
            HourModel.getLastLoggedHours(req.db, req.session, this.MULTI("hours"));
        }, function(response) {
            var projects;
            if (response["created"].success && response["added"].success) {
                var created = response["created"].message;
                var added = response["added"].message;
                projects = created.concat(added);
            } else {
                projects = [];
            }

            res.render("user/home", {
                user: response["user"].success ? response["user"].message : {},
                projects: projects,
                hours: response["hours"].success ? response["hours"].message : []
            });
        }
    )
});

router.get("/project/:id", middleware.auth, function(req, res, next) {
    flow.exec(
        function() {
            UserModel.getUser(req.db, req.session.userid, this.MULTI("user"));
            ProjectModel.getProject(req.db, req.session, req.params.id, this.MULTI("project"));
            HourModel.getProjectHours(req.db, req.params.id, this.MULTI("hours"));
            HourModel.getUserHoursOfProject(req.db, req.session, req.params.id, this.MULTI("userhours"));
        }, function(response) {
            var project = response["project"].message;
            project.hours = response["hours"].message.hours;

            res.render("user/project/view", {
                user: response["user"].success ? response["user"].message : {},
                project: project,
                userhours: response["userhours"].message
            })
        }
    )
});

router.get("/user/projects", middleware.auth, function(req, res, next) {
    flow.exec(
        function() {
            UserModel.getUser(req.db, req.session.userid, this.MULTI("user"));
            ProjectModel.getCreatedProjects(req.db, req.session, this.MULTI("created"));
            ProjectModel.getAddedProjects(req.db, req.session, this.MULTI("added"));
        }, function(response) {
            res.render("user/projects", {
                user: response["user"].success ? response["user"].message : {},
                created: response["created"].success ? response["created"].message : [],
                added: response["added"].success ? response["added"].message : [],
            });
        }
    );
})

router.get("/user/project/create", middleware.auth, function(req, res, next) {
    UserModel.getUser(req.db, req.session.userid, function(response) {
        res.render("user/project/create", {
            user: response.success ? response.message : {}
        });
    })
});

module.exports = router;
