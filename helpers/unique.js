var url = require("url");

/**
 * These field are not allowed to be checked for unique values.
 */
var forbiddenFields = [
    "password",
    "_id"
];

/**
 * Requires the following GET variables.
 * collection {String}        The DB collection to check.
 * field      {String}        The DB field to check.
 * value      {String/Number} The value to check.
 * ignoreSelf {Boolean}       If true it will ignore itself in the database.
 *      This means that if you have the following query:
 *      /unique?collection=users&field=name&value=Henk&ignoreSelf=true&id=123
 *      And the database finds a user with name Henk and with id=123 it will
 *      still return true, because except for the user with the given id it
 *      is a unique value. Usefull when renaming items.
 *
 * id         {String}        Only needed when ignoreSelf is set to true.
 */
module.exports.isUnique = function(req, res, next) {
    var query = url.parse(req.url, true).query;

    var collection = req.db.get(query.collection);

    var dbquery = {};
    dbquery[query.field] = query.value.toUpperCase();
    var id = query.id;

    if (forbiddenFields.indexOf(query.field) != -1) {
        res.send({error:"Unable to check the requested field."});
        return;
    }

    collection.find(dbquery, {}, function(e, docs) {
        if (docs.length == 0) {
            res.send({unique:true});
        } else {
            if (docs.length == 1) {
                res.send({unique: (docs[0]._id == id)});
            } else {
                res.send({unique:false});
            }
        }
    });
}
