const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mysql = require('mysql2');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true
}));

require('./middleware')(app, mysql);

// default route
app.get('/', function (req, res) {
	return res.send({ error: true, message: 'hello' })
});

require('./routes')(app, mysql);

// port must be set to 8080 because incoming http requests are routed from port 80 to port 8080
app.listen(8080, function () {
	console.log('Node app is running on port 8080');
});