var express = require("express");
var url = require("url");
var unique = require("../helpers/unique.js");
var router = express.Router();

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

router.get("/user/prefix", function(req, res, next) {
    var query = url.parse(req.url, true).query;
    UserModel.findUserByPrefix(req.db, query.prefix, function(response) {
        res.send(response);
    })
})

router.post("/project/create", function(req, res, next) {
    ProjectModel.create(req.db, req.session, req.body, function(response) {
        res.send(response);
    });
});

module.exports = router;
