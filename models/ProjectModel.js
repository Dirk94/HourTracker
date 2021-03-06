var cb = require("../helpers/callback.js");
var UserModel = require("./UserModel.js");
var HourModel = require("./HourModel.js");
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
                UserModel.getUserDataFromEmails(db, data.users, this);
            }, function(response) {
                var userdata = response.success ? response.message : [];

                var projects = db.get(COLLECTION);

                projects.insert({
                    name: data.name,
                    creator: session.userid,
                    users: userdata,
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
        log.error("ProjectModel.prototype.create: " + error);
    }
}

ProjectModel.prototype.delete = function(db, session, projectid, callback) {
    try {
        var projects = db.get(COLLECTION);

        flow.exec(
            function() {
                projects.findById(projectid, {}, this);
            }, function(error, document) {
                if (error) { throw error; }
                if (document == undefined) {
                    callback(cb.failed("Project not found."));
                    return;
                }

                if (document.creator != session.userid) {
                    callback(cb.failed("You don't have permission to do this."));
                    return;
                }

                HourModel.deleteHoursOfProject(db, projectid, this);
            }, function(response) {
                if (!response.success) {
                    callback(response);
                    return;
                }

                projects.remove({_id: projectid}, this);
            }, function(error) {
                if (error) { throw error; }
                callback(cb.success("Project deleted successfully."));
            }
        );
    } catch(error) {
        callback(cb.failed("Unknown error occured."));
        console.log("ProjectModel.delete: " + error);
    }
}

ProjectModel.prototype.edit = function(db, session, data, callback) {
    try {
        var projects = db.get(COLLECTION);

        flow.exec(
            function() {
                projects.findById(data._id, {}, this);
            }, function(error, document) {
                if (error) { throw error; }
                if (document == undefined) {
                    callback(cb.failed("Project not found."));
                    return;
                }

                if (document.creator != session.userid) {
                    callback(cb.failed("You don't have permission to do this."));
                    return;
                }

                UserModel.getUserDataFromEmails(db, data.users, this);
            }, function(response) {
                var userdata = response.success ? response.message : [];

                projects.findAndModify({ _id: data._id }, { $set: {
                    name: data.name,
                    users: userdata,
                    description: data.description
                } }, this);
            }, function(error, project) {
                if (error) { throw error; }
                callback(cb.success(project));
            }
        )
    } catch(error) {
        callback(cb.failed("Unknown error occured."));
        log.error("ProjectModel.prototype.edit: " + error);
    }
}

ProjectModel.prototype.getProject = function(db, session, projectid, callback) {
    try {
        var projects = db.get(COLLECTION);

        flow.exec(
            function() {
                projects.findById(projectid, {}, this);
            }, function(error, document) {
                if (error) { throw error; }

                if (document == undefined) {
                    callback(cb.failed("Project not found."));
                    return;
                }

                callback(cb.success(document));
            }
        );
    } catch(error) {
        callback(cb.failed("Unknown error occured."));
        log.error("ProjectModel.prototype.getProject: " + error);
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
        log.error("ProjectModel.prototype.getCreatedProjects: " + error);
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
            log.error("ProjectModel.prototype.getAddedProjects: " + error);
    }
}

ProjectModel.prototype.getAllProjects = function(db, session, callback) {
    var _this = this;
    flow.exec(
        function() {
            _this.getCreatedProjects(db, session, this.MULTI("created"));
            _this.getAddedProjects(db, session, this.MULTI("added"));
        }, function(response) {
            var projects;
            if (response["created"].success && response["added"].success) {
                projects = (response["created"].message).concat(response["added"].message);
            } else {
                projects = [];
            }
            callback(cb.success(projects));
        }
    )
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

                for (var i=0; i<document.users.length; i++) {
                    if (document.users[i] == session.userid) {
                        callback(cb.success(""));
                        return;
                    }
                }

                callback(cb.failed("You don't have permission to do this."));
            }
        )
    } catch(error) {
        callback(cb.failed("Unknown error occured."));
        log.error("ProjectModel.prototype.isUserOfProject: " + error);
    }
}

ProjectModel.prototype.getProjectFromId = function(db, projectid, callback) {
    try {
        var projects = db.get(COLLECTION);

        flow.exec(
            function() {
                projects.findById(projectid, {}, this);
            }, function(error, document) {
                if (error) { throw error; }

                if (document == undefined) {
                    callback(cb.failed("Project not found."));
                    return;
                }

                callback(cb.success(document));
            }
        )
    } catch(error) {
        callback(cb.failed("Unknown error occured."));
        log.error("ProjectModel.prototype.getProjectFromId: " + error);
    }
}

module.exports = new ProjectModel();
