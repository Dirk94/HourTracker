var cb = require("../helpers/callback.js");
var UserModel = require("./UserModel.js");

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
    var projects = db.get(COLLECTION);
    console.log(JSON.stringify(data));

    if (data.name == undefined) { callback(cb.failed("Please enter a valid name.")); return; }

    UserModel.getIdsFromEmails(db, data.users, function(response) {
        var ids = [];
        if (response.success) {
            ids = response.message;
        }

        projects.insert({
            name: data.name,
            creator: session.userid,
            users: ids,
            description: data.description,
            datetime: new Date()
        }, function(error, document) {
            if (error) {
                console.log(error);
                callback(cb.failed("Unknown error occured."));
            } else {
                callback(cb.success(document._id));
            }
        });
    });
}

module.exports = new ProjectModel();
