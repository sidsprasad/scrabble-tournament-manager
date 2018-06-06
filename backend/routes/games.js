module.exports = function(router, db) {

	router.get('/getGames', function (req, res) {

		let gameId = req.query.gameId;
		let leagueId = req.query.leagueId;
		let playerId = req.query.playerId;
		let playerOneId = req.query.playerOneId;
		let playerTwoId = req.query.playerTwoId;

		if (!gameId && !leagueId && !playerId && !(playerOneId && playerTwoId)) {
			return res.status(400).send({ error:true, 
				message: 'Parameters required: gameId OR leagueId OR playerId OR (playerOneId AND playerTwoId), in that order of precedence.' });
		}

		if (gameId) {
			db.query('SELECT * FROM leagueGames WHERE id=?', gameId, function (error, results, fields) {
				if (error) throw error;
				return res.send({ error: false, data: results, message: 'Game with given gameId.' });
			});
		} else if (leagueId) {
			db.query('SELECT * FROM leagueGames WHERE leagueId=?', leagueId, function (error, results, fields) {
				if (error) throw error;
				return res.send({ error: false, data: results, message: 'Games with given leagueId.' });
			});
		} else if (playerId) {
			db.query('SELECT * FROM leagueGames WHERE playerOne=? OR playerTwo=?', [playerId, playerId], function (error, results, fields) {
				if (error) throw error;
				return res.send({ error: false, data: results, message: 'Games where given playerId is a participant.' });
			});
		} else {
			db.query('SELECT * FROM leagueGames WHERE (playerOne=? AND playerTwo=?) OR (playerTwo=? AND playerOne=?)',
					[playerOneId, playerTwoId, playerOneId, playerTwoId], function (error, results, fields) {
				if (error) throw error;
				return res.send({ error: false, data: results, message: 'Games between given playerIds.' });
			});
		}
	});


	router.post('/:gameId/updateScore/:action', function (req, res) {

		let gameId = req.params.gameId;
		let action = req.params.action;

		let username = req.locals.username;

		if (!gameId || !action) {
			return res.status(400).send({ error:true, 
				message: 'Usage: /<gameId>/updateScore/<action>.' });
		}

		var allowedActions = ['enter','counter','accept'];
		if (allowedActions.indexOf(action) == -1) {
			return res.status(400).send({ error:true, message: 'Actions allowed: \'enter\', \'counter\', \'accept\'.' });
		}
		db.query('SELECT * FROM leagueGames WHERE id=?', gameId, function (error, results, fields) {
			if (error) throw error;
			//return res.send({ error: false, data: results, message: 'Game with given gameId.' });
			if (!results[0]) {
				return res.status(400).send({ error:true, message: 'Invalid gameId.' });
			}

			var currUser;
			if (results[0].playerOne == currUser) {
				currUser = "p1";
			} else if (results[0].playerTwo == currUser) {
				currUser = "p2";
			} else {
				return res.status(400).send({ error:true, message: 'You are not a participant.' });
			}

			var currentScoreStatusCode = results[0].scoreStatusCode;

			if (currentScoreStatusCode === 'none' && action === 'enter') {

				let p1Score = req.query.playerOneScore;
				let p2Score = req.query.playerTwoScore;

				if (!p1Score || !p2Score) {
					return res.status(400).send({ error:true, message: 'Please provide playerOneScore and playerTwoScore.'});
				}

				db.query("UPDATE leagueGames SET ? WHERE id = ?", [{ playerOneScore: p1Score, playerTwoScore: p2Score, scoreStatusCode: currUser+"entered" }, gameId], function (error, results, fields) {
					if (error) throw error;
					return res.send({ error: false, message: 'Score has been entered.' });
				});

			} else if ((currentScoreStatusCode === 'p1entered' || currentScoreStatusCode === 'p2entered') && action === 'counter') {

				let p1Score = req.query.playerOneScore;
				let p2Score = req.query.playerTwoScore;

				if (!p1Score || !p2Score) {
					return res.status(400).send({ error:true, message: 'Please provide playerOneScore and playerTwoScore.'});
				}

				db.query("UPDATE leagueGames SET ? WHERE id = ?", [{ playerOneScore: p1Score, playerTwoScore: p2Score, scoreStatusCode: currUser+"countered" }, gameId], function (error, results, fields) {
					if (error) throw error;
					return res.send({ error: false, data: results, message: 'Score has been countered.' });
				});

			} else if (currentScoreStatusCode === 'accepted') {

				return res.status(400).send({ error:true, message: 'Score has already been accepted. Contact an admin.'});

			} else if (currentScoreStatusCode !== 'none' && action === 'accept') {

				db.query("UPDATE leagueGames SET ? WHERE id = ?", [{ scoreStatusCode: "accepted" }, gameId], function (error, results, fields) {
					if (error) throw error;
					return res.send({ error: false, data: results, message: 'Score has been accepted.' });
				});

			} else {

				return res.status(400).send({ error:true, message: 'Invalid action. Current game status is \'' + currentScoreStatusCode + '\'.'});

			}
		});

	});


	return router;

}