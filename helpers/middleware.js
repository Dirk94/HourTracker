var ProjectModel = require("../models/ProjectModel.js");
var cb = require("./callback.js");

/**
 * Checks if the user is logged in. If not redirects to the login page.
 */
module.exports.auth = function(req, res, next) {
    if (req.session.userid) {
        return next();
    }

    res.redirect("/login");
}

/**
 * Checks if the user is logged in.
 * Differs from auth in that it sends a simple JSON response upon failure.
 * { success: false, message: "You are not logged in."}
 * This is used in the API.
 */
module.exports.apiAuth = function(req, res, next) {
    if (req.session.userid) {
        return next();
    }

    res.send(cb.failed("You are not logged in."));
}

module.exports.isUserOfProject = function(req, res, next) {
    var projectid = req.body.project;

    ProjectModel.isUserOfProject(req.db, req.session, req.body.project, function(response) {
        if (response.success) {
            return next();
        } else {
            res.send(response);
        }
    });
}
