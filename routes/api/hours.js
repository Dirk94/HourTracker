var express = require("express");
var router = express.Router();
var flow = require("flow");
var middleware = require("../../helpers/middleware.js");

var HourModel = require("../../models/HourModel.js");

// Deletes the hour, and upon success gives back the last 5 logged hours.
router.delete("/users/:userid/hours/:hourid", middleware.apiAuth, function(req, res, next) {
    flow.exec(
        function() {
            HourModel.deleteHours(req.db, req.session, req.params.hourid, this);
        }, function(response) {
            if (!response.success) {
                res.send(response);
            } else {
                HourModel.getLastLoggedHours(req.db, req.session, this);
            }
        }, function(response) {
            res.send(response);
        }
    )
});

// Creates a new hour entry.
router.post("/users/:userid/hours", middleware.apiAuth, function(req, res, next) {
    flow.exec(
        function() {
            HourModel.logHours(req.db, req.session, req.body, this);
        }, function(response) {
            if (!response.success) {
                res.send(response);
            } else {
                HourModel.getLastLoggedHours(req.db, req.session, this);
            }
        }, function(response) {
            res.send(response);
        }
    )
});

module.exports = router;
