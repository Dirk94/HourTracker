module.exports.auth = function(req, res, next) {
    console.log("Called!");
    console.log("id: " + req.session.userid);
    if (req.session.userid) {
        console.log("returning next!");
        return next();
    }
    console.log("returning redcirect");

    res.redirect("/login");
}
