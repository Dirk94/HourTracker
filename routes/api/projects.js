var express = require("express");
var router = express.Router();
var middleware = require("../../helpers/middleware.js");
var ProjectModel = require("../../models/ProjectModel.js");

router.post("/users/:userid/projects", middleware.apiAuth, function(req, res, next) {
    ProjectModel.create(req.db, req.session, req.body, function(response) {
        res.send(response);
    })
});

router.delete("/users/:userid/projects/:projectid", middleware.apiAuth, function(req, res, next) {
    // TODO implement this.
});

module.exports = router;
