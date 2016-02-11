var cb = require("../helpers/callback.js");

const COLLECTION = "users";

var UserModel = function() { };

/**
 * Returns an array of strings containing 'username | email' of all users
 * whose name or email starts with the prefix.
 * callback(response): response containing success, message.
 * if success is true, message is an array otherwise a string.
 */
UserModel.prototype.findUserByPrefix = function(db, prefix, callback) {
    var users = db.get(COLLECTION);
    users.find({ $or: [ {email: new RegExp("^" + prefix)}, {name: new RegExp("^" + prefix)} ] }, {}, function(error, documents) {
        if (error) {
            callback(cb.failed("Unknown error occured."));
            console.log(error);
            return;
        }

        var users = [];
        for (var i=0; i<documents.length; i++) {
            var document = documents[i];
            users.push({
                name: document.name,
                email: document.email
            });
        }

        callback(cb.success(users));
    });
}

/**
 * callback(response): response containing success, message.
 * If success is true message is the user id, otherwise the error string.
 */
UserModel.prototype.getIdFromEmail = function(db, email, callback) {
    var users = db.get(COLLECTION);
    users.find({email: email}, {}, function(error, documents) {
        if (error) {
            callback(cb.failed("Unknown error occured."));
            console.log(error);
            return;
        }

        if (documents.length == 0) {
            callback(cb.failed("User not found."));
            return;
        }

        var user = documents[0];
        callback(cb.success(user._id));
    })
}

/**
 * emails: array of emails. example: ["a@a.nl", "b@b.nl"]
 * callback(response): response containing success, message.
 * If success is true message is an array of ids, example: [1, 2, 3]
 * otherwise it contains the error message.
 */
UserModel.prototype.getIdsFromEmails = function(db, emails, callback) {
    var users = db.get(COLLECTION);

    if (emails == undefined) { callback(cb.failed("No emails supplied.")); return; }
    if (emails.length <= 0) { callback(cb.failed("Invalid emails supplied.")); return; }

    var query = [];
    for (var i=0; i<emails.length; i++) {
        query.push({
            email: emails[i]
        });
    }

    users.find({ $or: query }, {}, function(error, documents) {
        if (error) {
            callback(cb.failed("Unknown error occured."));
            console.log(error);
            return;
        }

        if (documents.length == 0) {
            callback(cb.failed("User not found."));
            return;
        }

        var ids = [];
        for (var i=0; i<documents.length; i++) {
            ids.push(documents[i]._id);
        }
        callback(cb.success(ids));
    });
}

/**
 * callback(response): response containing success, message.
 * If success is true, message is an object consisting of name, email, date
 */
UserModel.prototype.getUser = function(db, id, callback) {
    var users = db.get(COLLECTION);
    users.findById(id, function(error, document) {
        if (error) {
            callback(cb.failed("Unknown error occured."));
            console.log(error);
            return;
        }

        if (document == undefined) {
            callback(cb.failed("User not found."));
            return;
        }

        callback(cb.success({
            name: document.name,
            email: document.email,
            date: document.datetime
        }));
    })
}

/**
 * data: An object containing: name, email, password.
 * callback(response): response containing success, message.
 */
UserModel.prototype.register = function(db, data, callback) {
    if (data.email == undefined) { callback(cb.failed("Please enter a valid email.")); return; }
    if (data.password == undefined) { callback(cb.failed("Please enter a valid password.")); return; }

    var users = db.get(COLLECTION);
    users.find({email: data.email}, {}, function(error, documents) {
        if (error) {
            console.log(error);
            callback(cb.failed("Unknown error occured."));
        }
        if (documents.length == 0) {
            users.insert({
                name: data.name,
                email: data.email,
                password: data.password,
                datetime: new Date()
            }, function(error) {
                if (error) {
                    console.log(error);
                    callback(cb.failed("Unknown error occured."));
                }
            });
            callback(cb.success("Your account has been created."));
        } else {
            callback(cb.failed("The email already exists."));
        }
    });
}

/**
 * data: An object containing: name, email.
 * callback(response): response containing success, message.
 */
UserModel.prototype.login = function(db, session, data, callback) {
    if (data.email == undefined) { callback(cb.failed("Please enter a valid email.")); return; }
    if (data.password == undefined) { callback(cb.failed("Please enter a valid password.")); return; }

    var users = db.get(COLLECTION);
    users.find({email: data.email, password: data.password}, {}, function(error, documents) {
        if (error) {
            callback(cb.failed("Unknown error occured."));
            console.log(error);
            return;
        }
        if (documents.length == 0) {
            callback(cb.failed("Incorrect username or password."));
        } else {
            session.userid = documents[0]._id;
            callback(cb.success(""));
        }
    });
}

/**
 * Logs out a user, does not care if there is no user logged in.
 * callback(): Gets called after the user is logged out.
 */
UserModel.prototype.logout = function(session, callback) {
    session.destroy();
    callback();
}

module.exports = new UserModel();
