var cb = require("../helpers/callback.js");
var flow = require("flow");

const COLLECTION = "users";

var UserModel = function() { };

/**
 * Returns an array of strings containing 'username | email' of all users
 * whose name or email starts with the prefix.
 * callback(response): response containing success, message.
 * if success is true, message is an array otherwise a string.
 */
UserModel.prototype.findUserByPrefix = function(db, prefix, callback) {
    try {
        var users = db.get(COLLECTION);

        flow.exec(
            function() {
                users.find({ $or: [
                        {emailUppercase: new RegExp("^" + prefix.toUpperCase())},
                        {nameUppercase: new RegExp("^" + prefix.toUpperCase())}
                    ] }, {}, this);
            }, function(error, documents) {
                if (error) { throw error; }

                var users = [];
                for (var i=0; i<documents.length; i++) {
                    var document = documents[i];
                    users.push({
                        name: document.name,
                        email: document.email
                    });
                }

                callback(cb.success(users));
            }
        );
    } catch(error) {
        callback(cb.failed("Unknown error occured."));
        log.error("UserModel.prototype.findUserByPrefix: " + error);
    }
}

/**
 * emails: array of emails. example: ["a@a.nl", "b@b.nl"]
 * callback(response): response containing success, message.
 * If success is true message is an array of ids, example: [1, 2, 3]
 * otherwise it contains the error message.
 */
UserModel.prototype.getUserDataFromEmails = function(db, emails, callback) {
    try {
        if (emails == undefined) {
            callback(cb.failed("No emails supplied."));
            return;
        }
        if (emails.length <= 0) {
            callback(cb.failed("Invalid emails supplied."));
            return;
        }

        var query = [];
        for (var i=0; i<emails.length; i++) {
            query.push({emailUppercase: emails[i].toUpperCase()});
        }

        var users = db.get(COLLECTION);

        flow.exec(
            function() {
                users.find({ $or: query }, {}, this);
            }, function(error, documents) {
                if (error) { throw error; }

                if (documents.length <= 0) {
                    callback(cb.failed("User not found."));
                    return;
                }

                var data = [];
                for (var i=0; i<documents.length; i++) {
                    data.push({
                        id: documents[i]._id.toString(),
                        name: documents[i].name,
                        email: documents[i].email
                    });
                }
                callback(cb.success(data));
            }
        )
    } catch(error) {
        callback(cb.failed("Unknown error occured."));
        log.error("UserModel.prototype.getIdsFromEmails: " + error);
    }
}

/**
 * callback(response): response containing success, message.
 * If success is true, message is an object consisting of name, email, date
 */
UserModel.prototype.getUser = function(db, id, callback) {
    try {
        var users = db.get(COLLECTION);

        flow.exec(
            function() {
                users.findById(id, this);
            }, function(error, document) {
                if (error) { throw error; }

                if (document == undefined) {
                    callback(cb.failed("User not found."));
                    return;
                }

                callback(cb.success({
                    userid: document._id,
                    name: document.name,
                    email: document.email,
                    date: document.datetime
                }));
            }
        );
    } catch(error) {
        callback(cb.failed("Unknown error occured."));
        log.error("UserModel.prototype.getUser: " + error);
    }
}

/**
 * data: An object containing: name, email, password.
 * callback(response): response containing success, message.
 */
UserModel.prototype.register = function(db, data, callback) {
    try {
        if (data.email == undefined) {
            callback(cb.failed("Please enter a valid email."));
            return;
        }
        if (data.password == undefined) {
            callback(cb.failed("Please enter a valid password."));
            return;
        }

        var users = db.get(COLLECTION);

        flow.exec(
            function() {
                users.find({emailUppercase: data.email.toUpperCase()}, {}, this);
            }, function(error, documents) {
                if (error) { throw error; }

                if (documents.length > 0) {
                    callback(cb.failed("The email already exists."));
                    return;
                }

                users.insert({
                    name: data.name,
                    nameUppercase: data.name.toUpperCase(),
                    email: data.email,
                    emailUppercase: data.email.toUpperCase(),
                    password: data.password,
                    datetime: new Date()
                }, this)
            }, function(error) {
                if (error) {
                    throw error;
                } else {
                    callback(cb.success("Your account has been created."));
                }
            }
        )
    } catch(error) {
        callback(cb.failed("Unknown error occured."));
        log.error("UserModel.prototype.register: " + error);
    }
}

/**
 * data: An object containing: name, email.
 * callback(response): response containing success, message.
 */
UserModel.prototype.login = function(db, session, data, callback) {
    try {
        if (data.email == undefined) {
             callback(cb.failed("Please enter a valid email."));
             return;
        }
        if (data.password == undefined) {
            callback(cb.failed("Please enter a valid password."));
            return;
        }

        var users = db.get(COLLECTION);

        flow.exec(
            function() {
                users.find({emailUppercase: data.email.toUpperCase(), password: data.password}, {}, this);
            }, function(error, documents) {
                if (error) { throw error; }

                if (documents.length == 0) {
                    callback(cb.failed("Incorrect username or password."));
                    return;
                }


                session.userid = documents[0]._id;
                callback(cb.success(""));
            }
        );
    } catch(error) {
        callback(cb.failed("Unknown error occured."));
        log.error("UserModel.prototype.login: " + error);
    }
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
