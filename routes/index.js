var express = require("express");
var router = express.Router();
var flow = require("flow");

var middleware = require("../helpers/middleware.js");
var UserModel = require("../models/UserModel.js");
var ProjectModel = require("../models/ProjectModel.js");

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
            ProjectModel.getCreatedProjects(req.db, req.session, this.MULTI("createdProjects"));
            ProjectModel.getAddedProjects(req.db, req.session, this.MULTI("addedProjects"));
        }, function(response) {
            var robj = {
                user: response["user"].message,
                projects: (response["createdProjects"].message).concat(response["addedProjects"].message)
            };
            res.render("user/home", robj);
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
