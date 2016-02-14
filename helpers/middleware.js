var ProjectModel = require("../models/ProjectModel.js");

module.exports.auth = function(req, res, next) {
    if (req.session.userid) {
        return next();
    }

    res.redirect("/login");
}

module.exports.canLogHours = function(req, res, next) {
    ProjectModel.isUserOfProject(req.db, req.session, req.body.project, function(response) {
        if (response.success) {
            return next();
        } else {
            res.render(response);
        }
    });
}
