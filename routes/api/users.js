var express = require("express");
var router = express.Router();

var UserModel = require("../../models/UserModel.js");

// Create a new user.
router.post("/users", function(req, res, next) {
    UserModel.register(req.db, req.body, function(response) {
        res.send(response);
    })
});

router.post("/users/login", function(req, res, next) {
    UserModel.login(req.db, req.session, req.body, function(response) {
        res.send(response);
    })
});

router.get("/users/logout", function(req, res, next) {
    req.session.destroy();
    res.redirect("/");
});


module.exports = router;
