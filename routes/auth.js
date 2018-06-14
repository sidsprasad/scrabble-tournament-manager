module.exports = function(router, db) {

	const jwt = require('jsonwebtoken');
	const bcrypt = require('bcrypt');
	const xss = require('xss');

	router.post('/', function (req, res) {
	
		let username = req.body.username;
		let password = req.body.pass;

		let invalidCredsString = "Invalid Username or Password.";
	
		db.query('SELECT username, passHash, adminLevel FROM players WHERE username=?', username, function (error, results, fields) {
			if (error) throw error;
			
			if(results[0]) {

				bcrypt.compare(password, results[0].passHash, function(err, result) {
					if(result) {
					 	// Passwords match
						tokenParam = { exp: Math.floor(Date.now() / 1000) + (60 * 60) /*expiresIn()*/, username: username, adminLevel: results[0].adminLevel };
						//console.log(tokenParam);
						//console.log(require('../config/secret')());
						var token = jwt.sign(tokenParam, require('../config/secret')());

						return res.send({ error: false, message: 'Welcome. Here is your token.', token: token , adminLevel: results[0].adminLevel});
					} else {
						return res.send({ error: true, message: invalidCredsString });
					} 
				});

			} else {
				db.query('SELECT username FROM accountCreationRequests WHERE username=?', username, function (error, results, fields) {
					if(results[0]) {
						return res.send({ error: true, message: 'Account not yet approved by admins.' });
					} else {
						return res.send({ error: true, message: invalidCredsString });
					}
				});
			}

		});

	});

	router.post('/requestAccount', function (req,res) {

		let email = req.body.email;
		let username = String(req.body.username).toLowerCase();
		let number = xss(req.body.number);
		let password = req.body.newPass;

		let message = xss(req.body.message);

		if (!email || !username || !number || !password) {
			return res.send({ error: true, message: 'Email ID, username, phone number and password are all are required.'});
		}

		if(email.length > 255  || !validateEmail(email)) {
			return res.send({ error: true, message: 'Invalid email ID.'});
		}

		if(username.length > 32 || !validateUsername(username)) {
			return res.send({ error: true, message: 'Invalid username.'});
		}

		if(number.length > 15) {
			return res.send({ error: true, message: 'Invalid Phone Number.'});
		}

		if(password.length > 60) {
			return res.send({ error: true, message: 'Max length of password is 60 characters.'});
		}

		if (message.length > 128) {
			return res.send({ error: true, message: 'Message too long! (Allowed 128 chars)'});
		}

		db.query('SELECT username FROM players WHERE username=? OR email=?', [username, email], function (error, results, fields) {
			if (error) throw error;
			
			if(results[0]) {
				return res.send({ error: true, message: 'The given username and/or email ID already exists.'});
			}

			bcrypt.hash(password, 10, function(error, hash) {
				if (error) throw error;

				db.query("INSERT INTO accountCreationRequests SET ?", { email: email, username: username, number: number, message: message, passHash: hash }, function (error, results, fields) {
					if (error) {
						return res.send({ error: true, message: 'The given username and/or email ID already requested.'});
						throw error;
					}
					return res.send({ error: false, message: 'Account requested.'});
				});
			});
		});

	});

	return router;

}

function expiresIn(numDays) {
	var dateObj = new Date();
	return dateObj.setDate(dateObj.getDate() + numDays);
}

function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

function validateUsername(username) {
    var re = /^[A-Za-z0-9]+(?:[ _-][A-Za-z0-9]+)*$/;
    return re.test(String(username).toLowerCase());
}

