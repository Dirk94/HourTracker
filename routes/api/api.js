var express = require("express");
var url = require("url");
var unique = require("../../helpers/unique.js");
var router = express.Router();
var middleware = require("../../helpers/middleware.js");

var UserModel = require("../../models/UserModel.js");

router.get("/unique", unique.isUnique);

router.get("/prefix", middleware.apiAuth, function(req, res, next) {
    var query = url.parse(req.url, true).query;
    UserModel.findUserByPrefix(req.db, query.prefix, function(response) {
        res.send(response);
    })
});

module.exports = router;
