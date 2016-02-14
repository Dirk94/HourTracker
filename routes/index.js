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

router.get("/user/projects", middleware.auth, function(req, res, next) {
    flow.exec(
        function() {
            UserModel.getUser(req.db, req.session.userid, this.MULTI("user"));
            ProjectModel.getCreatedProjects(req.db, req.session, this.MULTI("createdProjects"));
            ProjectModel.getAddedProjects(req.db, req.session, this.MULTI("addedProjects"));
        }, function(response) {
            res.render("user/projects", {
                user: response["user"].message,
                created: response["createdProjects"].message,
                added: response["addedProjects"].message
            });
        }
    );
})

router.get("/user/project/create", middleware.auth, function(req, res, next) {
    UserModel.getUser(req.db, req.session.userid, function(response) {
        res.render("user/project/create", {
            user: response.message
        });
    })
});

module.exports = router;
