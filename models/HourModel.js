var cb = require("../helpers/callback.js");
var flow = require("flow");
var time = require("../helpers/time.js");

var ProjectModel = require("./ProjectModel.js");

const COLLECTION = "hours";

var HourModel = function() { };

var THIS = this;

HourModel.prototype.create = function(db, session, data, callback) {
    try {
        if (data.project == undefined) {
            callback(cb.failed("Please select a project."));
            return;
        }

        if (!time.validTime(data.from) || !time.validTime(data.till)) {
            callback(cb.failed("Please enter a valid time. format: hh:mm"));
            return;
        }

        if (!time.validDate(data.date)) {
            callback(cb.failed("Please enter a valid date. format: dd-mm-yyyy"));
            return;
        }

        var hourslogged = time.getHourDifference(data.from, data.till);
        if (hourslogged < 0) {
            callback(cb.failed("The second time should be later than the first time."));
            return;
        }
        var hours = db.get(COLLECTION);

        flow.exec(
            function() {
                ProjectModel.getProjectFromId(db, data.project, this);
            },
            function(response) {
                if (!response.success) {
                    callback(cb.failed(response.message));
                    return;
                }

                projectname = response.message.name;
                hourslogged = hourslogged.toFixed(1);

                hours.insert({
                    project: data.project,
                    projectName: projectname,
                    hours: hourslogged,
                    from: data.from,
                    till: data.till,
                    date: data.date,
                    dateCreated: new Date(),
                    user: session.userid
                }, this);
            }, function(error, document) {
                if (error) { throw error; }
                callback(cb.success(document));
            }
        )
    } catch(error) {
        callback(cb.failed("Unknown error occured."));
        log.error("HourModel.prototype.create: " + error);
    }
}

HourModel.prototype.delete = function(db, session, hourid, callback) {
    try {
        var hours = db.get(COLLECTION);

        flow.exec(
            function() {
                hours.findById(hourid, {}, this);
            }, function(error, document) {
                if (error) { throw error; }

                if (document == undefined) {
                    callback(cb.failed("Hours not found."));
                    return;
                }

                if (document.user != session.userid) {
                    callback(cb.failed("You don't have permission to do this."));
                    return;
                }

                hours.remove({_id: document._id}, this)
            }, function(error) {
                if (error) { throw error; }
                callback(cb.success("Hours deleted successfully."));
            }
        )
    } catch(error) {
        callback(cb.failed("Unknown error occured."));
        log.error("HourModel.prototype.delete: " + error);
    }
}

HourModel.prototype.getLastLogged = function(db, session, callback) {
    try {
        var hours = db.get(COLLECTION);

        flow.exec(
            function() {
                hours.find({user: session.userid}, {limit: 5, sort: {"dateCreated": -1}}, this);
            }, function(error, documents) {
                if (error) { throw error; }

                callback(cb.success(documents));
            }
        );
    } catch(error) {
        callback(cb.failed("Unknown error occured."));
        log.error("HourModel.prototype.getLastLogged: " + error);
    }
}

HourModel.prototype.getProjectStats = function(db, session, projectid, callback) {
    try {
        var hours = db.get(COLLECTION);

        flow.exec(
            function() {
                hours.find({project: projectid}, {}, this.MULTI("project"));
                hours.find({project: projectid, user: session.userid}, {}, this.MULTI("user"));
            }, function(documents) {
                var projectresponse = documents[0];
                var userresponse = documents[1];

                var projectdocuments = (projectresponse != undefined) ? projectresponse[1] : [];
                var userdocuments = (userresponse != undefined) ? userresponse[1] : [];

                var hours = 0, hoursThisMonth = 0, projectHours = 0;

                for (var i=0; i<projectdocuments.length; i++) {
                    projectHours += parseFloat(projectdocuments[i].hours);
                }

                var currentMonth = new Date().getMonth();
                for (var i=0; i<userdocuments.length; i++) {
                    hours += parseFloat(userdocuments[i].hours);
                    var month = parseInt(userdocuments[i].date.match(/\d\d-(\d\d)-\d\d\d\d/)[1])-1;
                    if (currentMonth == month) {
                        hoursThisMonth += parseFloat(userdocuments[i].hours);
                    }
                }

                callback(cb.success({
                    projectHours: projectHours.toFixed(1),
                    userHours: hours.toFixed(1),
                    hoursThisMonth: hoursThisMonth.toFixed(1)
                }));
            }
        )
    } catch(error) {
        callback(cb.failed("Unknown error occured."));
        log.error("HourModel.prototype.getProjectStats: " + error);
    }
}

HourModel.prototype.getProjectLastLogged = function(db, session, projectid, callback) {
    try {
        var hours = db.get(COLLECTION);

        flow.exec(
            function() {
                hours.find({user: session.userid, project: projectid}, {sort: {"dateCreated": -1}}, this);
            }, function(error, documents) {
                if (error) { throw error; }
                callback(cb.success(documents));
            }
        )
    } catch(error) {
        callback(cb.failed("Unknown error occured."));
        log.error("HourModel.prototype.getProjectLastLogged: " + error);
    }
}

module.exports = new HourModel();
