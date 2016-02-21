var express = require("express");
var router = express.Router();
var flow = require("flow");
var middleware = require("../../helpers/middleware.js");
var ProjectModel = require("../../models/ProjectModel.js");

router.post("/users/:userid/projects", middleware.apiAuth, function(req, res, next) {
    ProjectModel.create(req.db, req.session, req.body, function(response) {
        res.send(response);
    })
});

router.post("/users/:userid/projects/:projectid/edit", middleware.apiAuth, function(req, res, next) {
    ProjectModel.edit(req.db, req.session, req.body, function(response) {
        res.send(response);
    });
})

router.get("/users/:userid/projects", middleware.apiAuth, function(req, res, next) {
    flow.exec(
        function() {
            ProjectModel.getCreatedProjects(req.db, req.session, this.MULTI("created"));
            ProjectModel.getAddedProjects(req.db, req.session, this.MULTI("added"));
        }, function(response) {
            res.send({
                created: response["created"].success ? response["created"].message : [],
                added: response["added"].success ? response["added"].message : [],
            });
        }
    );
})

router.delete("/users/:userid/projects/:projectid", middleware.apiAuth, function(req, res, next) {
    flow.exec(
        function() {
            ProjectModel.delete(req.db, req.session, req.params.projectid, this);
        }, function(response) {
            res.send(response);
        }
    )
});

module.exports = router;
