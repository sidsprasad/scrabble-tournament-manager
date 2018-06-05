const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mysql = require('mysql2');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true
}));

require('./middleware')(app);

// ROUTES
var router = require('express').Router();

app.set('view engine', 'ejs');
var frontEnd = require('./frontRoutes')(router);

var APIs = require('./apiRoutes')(router, mysql);


app.use("/", frontEnd)
app.use("/api", APIs);

//End of Routes


// port must be set to 8080 because incoming http requests are routed from port 80 to port 8080
app.listen(8080, function () {
	console.log('Node app is running on port 8080');
});