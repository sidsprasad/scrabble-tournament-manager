module.exports = function(app, mysql) {

	var jwt = require('jsonwebtoken');
	const db = mysql.createConnection({
	    host: 'localhost',
	    user: 'root',
	    password: 'root',
	    database: 'ScrabbleTournaments'
	});
	db.connect();

	app.use('/', function(req, res, next) {
		// console.log(req.originalUrl);
		if (req.originalUrl === "/" || req.originalUrl === "/auth") {
			next();
		}
		else {

			let token = req.headers['x-access-token'];
			// console.log(token)
			try {
				var decoded = jwt.verify(token, require('./config/secret')());
				// console.log(decoded);
				if (!decoded.username) {
					throw err;
				}
				res.locals.username = decoded.username;
			} catch (err) {
				return res.send({ error: true, message: 'Invalid Token.', error: err});
			}

			next();
		}
	});

}