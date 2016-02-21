var express = require("express");
var router = express.Router();
var flow = require("flow");
var UserModel = require("../../models/UserModel.js");

router.get("/", function(req, res, next) {
    UserModel.getUser(req.db, req.session.userid, function(response) {
        res.render("index", {
            user: response.success ? response.message : undefined
        });
    });
});

router.get("/register", function(req, res, next) {
    UserModel.getUser(req.db, req.session.userid, function(response) {
        res.render("register", {
            user: response.success ? response.message : undefined
        });
    });
});

router.get("/login", function(req, res, next) {
    UserModel.getUser(req.db, req.session.userid, function(response) {
        res.render("login", {
            user: response.success ? response.message : undefined
        });
    });
});

module.exports = router;
