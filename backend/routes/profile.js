module.exports = function(router, db) {

	router.get('/u/:playerId', function (req, res) {

		let playerId = req.params.playerId;

		if (!playerId) {
			return res.send({ error:true, message: 'Please enter player ID.' });
		}

		db.query('SELECT username, adminLevel, wins, draws, losses FROM players WHERE username=?', playerId, function (error, results, fields) {
			if (error) throw error;

			if (!results[0]) {
				return res.send({ error:true, message: 'Please enter valid player ID.' });
			}

			return res.send({ error: false, data: results[0], message: 'Player details.' });
		});
	});

	router.get('/u/:playerId/getParticipation', function (req, res) {

		let playerId = req.params.playerId;

		if (!playerId) {
			return res.send({ error: true, message: 'Please enter player ID.' });
		}

		db.query('SELECT id, name, startDate, wins, draws, losses FROM leagueParticipation INNER JOIN leagues ON leagueParticipation.leagueId=leagues.id WHERE username=? ORDER BY leagues.startDate DESC;', 
				playerId, function (error, results, fields) {
			if (error) throw error;

			return res.send({ error: false, data: results, message: 'List of contests specified player is participating in.' });
		});
	});

	router.get('/getAccountRequests', function (req, res) {

		let username = res.locals.username;
		let adminLevel = res.locals.adminLevel;

		if (adminLevel < 1) {
			return res.send({ error: true, message: 'You are not authorized.' });
		}

		db.query('SELECT * FROM accountCreationRequests', {}, function (error, results, fields) {
			if (error) throw error;
			return res.send({ error: false, data: results, message: 'List of Account Creation Requests.' });
		});
	});

	router.post('/makeAdmin', function (req,res) {

		let username = req.body.username;
		let adminLevel = req.body.adminLevel;

		let currUser = res.locals.username;
		let currAdminLevel = res.locals.adminLevel;

		if (!username || !adminLevel) {
			return res.send({ error: true, message: 'Please provide new admin\'s player ID and adminLevel.' });
		}

		if (currAdminLevel < 2) {
			return res.send({ error: true, message: 'You are not autorized.' });
		}

		db.query('SELECT username, adminLevel FROM players WHERE username=?', username, function (error, results, fields) {
			if (error) throw error;

			if (!results[0]) {
				return res.send({ error:true, message: 'Please enter valid player ID.' });
			}

			oldAdminLevel = results[0].adminLevel;

			if (oldAdminLevel > adminLevel) {
				return res.send({ error:true, message: 'Cannot demote using this endpoint. Use /removeAdmin.' });
			}

			db.query("UPDATE players SET adminLevel=? WHERE username = ?", [adminLevel,username], function (error, results, fields) {
				if (error) throw error;
				return res.send({ error: false, data: results, message: 'Added as admin.' });
			});
			
		});

	});

	return router;
}