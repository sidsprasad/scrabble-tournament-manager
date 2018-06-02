module.exports = function(app, db) {

	var jwt = require('jsonwebtoken');

	app.post('/auth', function (req, res) {
	
		let username = req.body.username;
		let passHash = req.body.pass; //TODO: Hash the password here.

	
		db.query('SELECT username FROM players WHERE username=? AND passHash=?', [username, passHash], function (error, results, fields) {
			if (error) throw error;
			
			if(results[0]) {
				tokenParam = { exp: Math.floor(Date.now() / 1000) + (60 * 60) /*expiresIn()*/, username: username };
				//console.log(tokenParam);
				//console.log(require('../config/secret')());
				var token = jwt.sign(tokenParam, require('../config/secret')());

				return res.send({ error: false, message: 'Welcome. Here is your token.', token: token });
			}

			return res.send({ error: true, message: 'Invalid Credentials.' });
		});

	});

}

function expiresIn(numDays) {
	var dateObj = new Date();
	return dateObj.setDate(dateObj.getDate() + numDays);
}