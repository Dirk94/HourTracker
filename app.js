var express = require("express");
var http = require("http");
var path = require("path");
var bodyparser = require("body-parser");
var db = require("monk")("localhost/timetracker");
var session = require("express-session");
var MongoStore = require("connect-mongo")(session);
var fs = require("fs");
var Log = require("log");

var app = express();

log = new Log('debug', fs.createWriteStream('timetracker.log'));

app.use(session({
    secret: "abc",
    store: new MongoStore({db: db.driver})
}));

// Register the db object.
app.use(function(req, res, next) {
    req.db = db;
    next();
});



app.use(bodyparser.json());

var routes = require("./routes/index");
var api = require("./routes/api");

app.use("/", routes);
app.use("/api", api);

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(express.static(path.join(__dirname, "public")));
app.use("/bower_components", express.static(path.join(__dirname, "bower_components")));

http.createServer(app).listen(80, function() {
    console.log("TimeTracker server listening on port " + 80);
});
