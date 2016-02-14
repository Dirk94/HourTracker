var cb = require("../helpers/callback.js");
var UserModel = require("./UserModel.js");
var flow = require("flow");

const COLLECTION = "projects";

var ProjectModel = function() { };

/**
 * data: An object containing {name, users: [], description}
 * users should be an array of user emails that are contributing to this project.
 * callback(response): Response object containing success, message.
 * If success is true message contains the project id. Otherwise it contains
 * the error message.
 */
ProjectModel.prototype.create = function(db, session, data, callback) {
    try {
        if (data.name == undefined) {
            callback(cb.failed("Please enter a valid name"));
            return
        }

        flow.exec(
            function() {
                UserModel.getIdsFromEmails(db, data.users, this);
            }, function(response) {
                var ids = response.success ? response.message : [];
                var projects = db.get(COLLECTION);

                projects.insert({
                    name: data.name,
                    creator: session.userid,
                    users: ids,
                    description: data.description,
                    datetime: new Date()
                }, this);
            }, function(error, document) {
                if (error) {
                    throw error;
                }

                callback(cb.success(document._id));
            }
        );
    } catch(error) {
        callback(cb.failed("Unknown error occured."));
        log.error(error);
    }
}

/**
 * callback(response): Response containing success, message.
 * If success is true message is the array of projects created by the user logged in.
 * Otherwise message contains the error string.
 */
ProjectModel.prototype.getCreatedProjects = function(db, session, callback) {
    try {
        var projects = db.get(COLLECTION);

        flow.exec(
            function() {
                projects.find({creator: session.userid}, {}, this);
            }, function(error, documents) {
                if (error) { throw error; }

                callback(cb.success(documents));
            }
        );
    } catch(error) {
        callback(cb.failed("Unknown error occured."));
        log.error(error);
    }
}

/**
 * callback(response): Response containing success, message.
 * If success is true message is the array of projects that the user has been added to.
 * Otherwise message contains the error string.
 */
ProjectModel.prototype.getAddedProjects = function(db, session, callback) {
    try {
        var projects = db.get(COLLECTION);

        flow.exec(
            function() {
                projects.find({users: session.userid }, {}, this);
            }, function(error, documents) {
                if (error) { throw error; }

                callback(cb.success(documents));
            }
        );
    } catch(error) {
            callback(cb.failed("Unknown error occured."));
            log.error(error);
    }
}

ProjectModel.prototype.isUserOfProject = function(db, session, projectid, callback) {
    try {
        var projects = db.get(COLLECTION);

        flow.exec(
            function() {
                projects.findById(projectid, {}, this)
            }, function(error, document) {
                if (error) { throw error; }

                if (document == undefined) {
                    callback(cb.failed("Project not found."));
                    return;
                }

                if (document.creator == session.userid) {
                    callback(cb.success(""));
                    return;
                }

                for (var i=0; i<document.users; i++) {
                    if (users[i] == session.userid) {
                        callback(cb.success(""));
                        return;
                    }
                }

                callback(cb.failed("You don't have permission to do this."));
            }
        )
    } catch(error) {
        callback(cb.failed("Unknown error occured."));
        log.error(error);
    }
}

module.exports = new ProjectModel();
