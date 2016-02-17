var express = require("express");
var router = express.Router();
var flow = require("flow");

var middleware = require("../../helpers/middleware.js");
var UserModel = require("../../models/UserModel.js");
var ProjectModel = require("../../models/ProjectModel.js");
var HourModel = require("../../models/HourModel.js");


router.get("/user/home", middleware.auth, function(req, res, next) {
    flow.exec(
        function() {
            UserModel.getUser(req.db, req.session.userid, this.MULTI("user"));
            ProjectModel.getAllProjects(req.db, req.session, this.MULTI("projects"));
            HourModel.getLastLogged(req.db, req.session, this.MULTI("hours"));
        }, function(response) {
            res.render("user/home", {
                user: response["user"].success ? response["user"].message : {},
                hours: response["hours"].success ? response["hours"].message : [],
                projects: response["projects"].success ? response["projects"].message : []
            });
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

router.get("/user/project/:id", middleware.auth, function(req, res, next) {
    flow.exec(
        function() {
            UserModel.getUser(req.db, req.session.userid, this.MULTI("user"));
            ProjectModel.getProject(req.db, req.session, req.params.id, this.MULTI("project"));

            HourModel.getProjectStats(req.db, req.session, req.params.id, this.MULTI("stats"));
            HourModel.getProjectLastLogged(req.db, req.session, req.params.id, this.MULTI("lastlogged2"));
        }, function(response) {
            console.log(JSON.stringify(response["lastlogged2"]));
            res.render("user/project/view", {
                user: response["user"].success ? response["user"].message : {},
                project: response["project"].success ? response["project"].message : {},
                stats: response["stats"].success ? response["stats"].message : {},
                lastlogged: response["lastlogged2"].success ? response["lastlogged2"].message : []
            });
        }
    )
});

router.get("/user/project/create", middleware.auth, function(req, res, next) {
    UserModel.getUser(req.db, req.session.userid, function(response) {
        res.render("user/project/create", {
            user: response.success ? response.message : {}
        });
    })
});

module.exports = router;
