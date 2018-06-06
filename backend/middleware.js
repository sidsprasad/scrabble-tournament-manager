module.exports = function(app) {

	var jwt = require('jsonwebtoken');

	app.use('/', function(req, res, next) {

		urlPath = req.originalUrl;
		splitUrlPath = urlPath.split("/");

		//console.log(req.originalUrl);
		//console.log(splitUrlPath);

		if(splitUrlPath[1]==="api" && splitUrlPath[2]!=="auth") {

			let token = req.headers['x-access-token'];
			// console.log(token)
			try {
				var decoded = jwt.verify(token, require('./config/secret')());
				// console.log(decoded);
				if (!decoded.username) {
					throw err;
				}
				
				res.locals.username = decoded.username;
				res.locals.adminLevel = decoded.adminLevel;
			} catch (err) {
				return res.send({ error: true, message: 'Invalid Token.', error: err});
			}

			next();

		} else {
			next();
		}

	});

}