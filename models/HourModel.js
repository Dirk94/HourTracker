var cb = require("../helpers/callback.js");
var flow = require("flow");
var time = require("../helpers/time.js");

var HourModel = require("./HourModel.js");

const COLLECTION = "hours";

var HourModel = function() { };

HourModel.prototype.logHours = function(db, session, data, callback) {
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

        var hours = db.get(COLLECTION);

        flow.exec(
            function() {
                hours.insert({
                    project: data.project,
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
        log.error(error);
    }
}

module.exports = new HourModel();
