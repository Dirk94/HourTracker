var express = require("express");
var http = require("http");
var path = require("path");
var bodyparser = require("body-parser");
var db = require("monk")("localhost/hourtracker");
var session = require("express-session");
var MongoStore = require("connect-mongo")(session);
var fs = require("fs");
var Log = require("log");

var app = express();

log = new Log('debug', fs.createWriteStream('hourtracker.log'));

app.use(session({
    secret: "abc",
    store: new MongoStore({
	url: 'mongodb://localhost:27017/hourtracker'
	
    })
}));

// Register the db object.
app.use(function(req, res, next) {
    req.db = db;
    next();
});

app.use(bodyparser.json());

var api = require("./routes/api/api");
var users = require("./routes/api/users");
var hours = require("./routes/api/hours");
var projects = require("./routes/api/projects");

app.use("/", require("./routes/site/index"));
app.use("/", require("./routes/site/user"));
app.use("/api", api);
app.use("/api", users);
app.use("/api", hours);
app.use("/api", projects);

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(express.static(path.join(__dirname, "public")));
app.use("/bower_components", express.static(path.join(__dirname, "bower_components")));

http.createServer(app).listen(80, function() {
    console.log("HourTracker server listening on port " + 80);
});
