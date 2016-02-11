var express = require("express");
var router = express.Router();
var middleware = require("../helpers/middleware.js");
var UserModel = require("../models/UserModel.js");

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
    UserModel.getUser(req.db, req.session.userid, function(response) {
        res.render("user/home", {
            user: response.message
        });
    });
});

router.get("/user/projects", middleware.auth, function(req, res, next) {
    UserModel.getUser(req.db, req.session.userid, function(response) {
        res.render("user/projects", {
            user: response.message
        });
    })
})

router.get("/user/project/create", middleware.auth, function(req, res, next) {
    UserModel.getUser(req.db, req.session.userid, function(response) {
        res.render("user/project/create", {
            user: response.message
        });
    })
})

module.exports = router;
