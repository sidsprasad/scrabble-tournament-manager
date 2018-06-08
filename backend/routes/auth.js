module.exports = function(router, db) {

	var jwt = require('jsonwebtoken');

	router.post('/', function (req, res) {
	
		let username = req.body.username;
		let passHash = req.body.pass; //TODO: Hash the password here.

	
		db.query('SELECT username, adminLevel FROM players WHERE username=? AND passHash=?', [username, passHash], function (error, results, fields) {
			if (error) throw error;
			
			if(results[0]) {
				tokenParam = { exp: Math.floor(Date.now() / 1000) + (60 * 60) /*expiresIn()*/, username: username, adminLevel: results[0].adminLevel };
				//console.log(tokenParam);
				//console.log(require('../config/secret')());
				var token = jwt.sign(tokenParam, require('../config/secret')());

				return res.send({ error: false, message: 'Welcome. Here is your token.', token: token , adminLevel: results[0].adminLevel});
			}

			return res.status(401).send({ error: true, message: 'Invalid Credentials.' });
		});

	});

	router.post('/requestAccount', function (req,res) {
		let email = req.body.email;
		let username = req.body.username;
		let message = req.body.message;

		if (!email || !username) {
			return res.send({ error: true, message: 'Email ID and username are required.'});
		}

		if (message.length > 128) {
			return res.send({ error: true, message: 'Message too long! (Allowed 128 chars)'});
		}

		db.query('SELECT username FROM players WHERE username=? OR email=?', [username, email], function (error, results, fields) {
			if (error) throw error;
			
			if(results[0]) {
				tokenParam = { exp: Math.floor(Date.now() / 1000) + (60 * 60) /*expiresIn()*/, username: username, adminLevel: results[0].adminLevel };
				//console.log(tokenParam);
				//console.log(require('../config/secret')());
				var token = jwt.sign(tokenParam, require('../config/secret')());

				return res.send({ error: true, message: 'The given username and/or email ID already exists.'});
			}

			db.query("INSERT INTO accountCreationRequests SET ?", { email: email, username: username, message: message }, function (error, results, fields) {
				if (error) throw error;
				return res.send({ error: false, message: 'Account requested.'});
			});
		});

	});

	return router;

}

function expiresIn(numDays) {
	var dateObj = new Date();
	return dateObj.setDate(dateObj.getDate() + numDays);
}