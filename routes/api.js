var express = require("express");
var url = require("url");
var unique = require("../helpers/unique.js");
var router = express.Router();
var middleware = require("../helpers/middleware.js");
var flow = require("flow");

var UserModel = require("../models/UserModel.js");
var ProjectModel = require("../models/ProjectModel.js");

router.post("/user/register", function(req, res, next) {
    UserModel.register(req.db, req.body, function(response) {
        res.send(response);
    });
});

router.post("/user/login", function(req, res, next) {
    UserModel.login(req.db, req.session, req.body, function(response) {
        res.send(response);
    });
});

router.get("/user/logout", function(req, res, next) {
    req.session.destroy();
    res.redirect("/");
});

router.get("/unique", unique.isUnique);

router.get("/user/prefix", middleware.auth, function(req, res, next) {
    var query = url.parse(req.url, true).query;
    UserModel.findUserByPrefix(req.db, query.prefix, function(response) {
        res.send(response);
    })
})

router.post("/project/create", middleware.auth, function(req, res, next) {
    ProjectModel.create(req.db, req.session, req.body, function(response) {
        res.send(response);
    });
});

router.get("/projects", middleware.auth, function(req, res, next) {
    flow.exec(
        function() {
            ProjectModel.getCreatedProjects(req.db, req.session, this.MULTI("created"));
            ProjectModel.getAddedProjects(req.db, req.session, this.MULTI("added"));
        }, function(response) {
            var createdProjects = response["created"];
            var addedProjects = response["added"];

            res.send({
                userid: req.session.userid,
                created: createdProjects.message,
                added: addedProjects.message
            });
        }
    )
});

module.exports = router;
