module.exports = function(router, db) {

	const jwt = require('jsonwebtoken');
	const bcrypt = require('bcrypt');

	router.post('/', function (req, res) {
	
		let username = req.body.username;
		let password = req.body.pass;

	
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
						return res.status(401).send({ error: true, message: 'Invalid Password.' });
					} 
				});
			} else {
				return res.status(401).send({ error: true, message: 'Invalid Username.' });
			}

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
				return res.send({ error: true, message: 'The given username and/or email ID already exists.'});
			}

			db.query("INSERT INTO accountCreationRequests SET ?", { email: email, username: username, message: message }, function (error, results, fields) {
				if (error) {
					return res.send({ error: true, message: 'The given username and/or email ID already requested.'});
					throw error;
				}
				return res.send({ error: false, message: 'Account requested.'});
			});
		});

	});

	router.post('/createAccount', function (req,res) {
		let email = req.body.email;
		let username = req.body.username;
		let OTP = req.body.OTP;
		let password = req.body.newPass;


		if (!email || !username || !OTP || !password) {
			return res.send({ error: true, message: 'Email ID, username, OTP and password are all are required.'});
		}

		if(password.length > 60) {
			return res.send({ error: true, message: 'Max length of password is 60 characters.'});
		}

		db.query('SELECT username FROM accountCreationRequests WHERE username=? AND email=? AND OTP=?', [username, email, OTP], function (error, results, fields) {
			if (error) throw error;
			
			if(results[0]) {
				//return res.send({ error: false, message: 'Valid Details. Make request to /setPassword.'});
				bcrypt.hash(password, 10, function(error, hash) {
					if (error) throw error;
					// Store hash in database
					db.beginTransaction(function (error){
						if(error) {
							db.rollback(function() {
								throw error;
							});
						}
						db.query("INSERT INTO players SET ?", { email: email, username: username, passHash: hash }, function (error, results, fields) {
							if(error) {
								db.rollback(function() {
									throw error;
								});
							}

							db.query("DELETE FROM accountCreationRequests WHERE username=? AND email=?", [username, email], function (error, results, fields) {
								if(error) {
									db.rollback(function() {
										throw error;
									});
								}
								db.commit(function (error) {
									if(error) {
										db.rollback(function() {
											throw error;
										});
									}	
									return res.send({ error: false, message: 'Account Created.'});
								});
							});
						});
					});
				});
			} else {
				return res.send({ error: true, message: 'Invalid information.'});
			}
		});

	});

	return router;

}

function expiresIn(numDays) {
	var dateObj = new Date();
	return dateObj.setDate(dateObj.getDate() + numDays);
}