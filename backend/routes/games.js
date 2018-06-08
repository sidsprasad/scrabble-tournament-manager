module.exports = function(router, db) {

	router.get('/getGames', function (req, res) {

		let gameId = req.query.gameId;
		let leagueId = req.query.leagueId;
		let playerId = req.query.playerId;
		let playerOneId = req.query.playerOneId;
		let playerTwoId = req.query.playerTwoId;

		if (!gameId && !leagueId && !playerId && !(playerOneId && playerTwoId)) {
			return res.send({ error:true, 
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
			// SELECT * FROM leagueGames WHERE playerOne=? OR playerTwo=?
			db.query('SELECT leagueGames.id, leagueId, name, playerOne, playerTwo, playerOneScore, playerTwoScore, scoreStatusCode, gameResultCode FROM leagueGames INNER JOIN leagues ON leagueGames.leagueId=leagues.id WHERE playerOne=? OR playerTwo=?',
				[playerId, playerId], function (error, results, fields) {
				if (error) throw error;
				return res.send({ error: false, data: results, message: 'Games where given playerId is a participant.' });
			});
		} else {
			db.query('SELECT leagueId, name, playerOne, playerTwo, playerOneScore, playerTwoScore, scoreStatusCode, gameResultCode FROM leagueGames INNER JOIN leagues ON leagueGames.leagueId=leagues.id WHERE (playerOne=? AND playerTwo=?) OR (playerTwo=? AND playerOne=?)',
					[playerOneId, playerTwoId, playerOneId, playerTwoId], function (error, results, fields) {
				if (error) throw error;
				return res.send({ error: false, data: results, message: 'Games between given playerIds.' });
			});
		}
	});


	router.post('/:gameId/updateScore/:action', function (req, res) {

		let gameId = req.params.gameId;
		let action = req.params.action;

		let currUser = res.locals.username;

		if (!gameId || !action) {
			return res.send({ error:true, 
				message: 'Usage: /<gameId>/updateScore/<action>.' });
		}

		var allowedActions = ['enter','counter','accept'];
		if (allowedActions.indexOf(action) == -1) {
			return res.send({ error:true, message: 'Actions allowed: \'enter\', \'counter\', \'accept\'.' });
		}
		db.query('SELECT * FROM leagueGames WHERE id=?', gameId, function (error, results, fields) {
			if (error) throw error;
			//return res.send({ error: false, data: results, message: 'Game with given gameId.' });
			if (!results[0]) {
				return res.send({ error:true, message: 'Invalid gameId.' });
			}

			if (results[0].playerOne == currUser) {
				currUser = "p1";
			} else if (results[0].playerTwo == currUser) {
				currUser = "p2";
			} else {
				return res.send({ error:true, message: 'You are not a participant.' });
			}


			var currP1 = results[0].playerOnw;
			var currP2 = results[0].playerTwo;
			var currP1Score = results[0].playerOneScore;
			var currP2Score = results[0].playerTwoScore;
			var currLeagueId = results[0].leagueId;

			var currentScoreStatusCode = results[0].scoreStatusCode;

			if (currentScoreStatusCode === 'none' && action === 'enter') {

				let p1Score = req.body.playerOneScore;
				let p2Score = req.body.playerTwoScore;

				if (!p1Score || !p2Score) {
					return res.send({ error:true, message: 'Please provide playerOneScore and playerTwoScore.'});
				}

				db.query("UPDATE leagueGames SET ? WHERE id = ?", [{ playerOneScore: p1Score, playerTwoScore: p2Score, scoreStatusCode: currUser+"entered" }, gameId], function (error, results, fields) {
					if (error) throw error;
					return res.send({ error: false, message: 'Score has been entered.' });
				});

			} else if ((currentScoreStatusCode === 'p1entered' || currentScoreStatusCode === 'p2entered' || currentScoreStatusCode === 'p1countered' || currentScoreStatusCode === 'p2countered') && action === 'counter') {

				let p1Score = req.body.playerOneScore;
				let p2Score = req.body.playerTwoScore;

				if (!p1Score || !p2Score) {
					return res.send({ error:true, message: 'Please provide playerOneScore and playerTwoScore.'});
				}

				db.query("UPDATE leagueGames SET ? WHERE id = ?", [{ playerOneScore: p1Score, playerTwoScore: p2Score, scoreStatusCode: currUser+"countered" }, gameId], function (error, results, fields) {
					if (error) throw error;
					return res.send({ error: false, data: results, message: 'Score has been countered.' });
				});

			} else if (currentScoreStatusCode === 'accepted') {

				return res.send({ error:true, message: 'Score has already been accepted. Contact an admin.'});

			} else if (currentScoreStatusCode !== 'none' && currentScoreStatusCode.charAt(1) !== currUser.charAt(1) && action === 'accept') {

				var gameResultCode;
				if (currP1Score>currP2Score) {
					gameResultCode = "P1W";
				} else if (currP1Score<currP2Score) {
					gameResultCode = "P2W";
				} else {
					gameResultCode = "DRAW";
				}
				db.query("UPDATE leagueGames SET ? WHERE id = ?", [{ scoreStatusCode: "accepted", gameResultCode: gameResultCode }, gameId], function (error, results, fields) {
					if (error) throw error;

					// db.query("UPDATE leagueParticipation SET ? WHERE id = ?", [{ scoreStatusCode: "accepted", gameResultCode: gameResultCode }, gameId], function (error, results, fields) {
						// if (error) throw error;
						return res.send({ error: false, data: results, message: 'Score has been accepted.' });
					// }
				});

			} else {

				return res.send({ error:true, message: 'Invalid action. You are: '+currUser+'. Current game status is \'' + currentScoreStatusCode + '\'.'});

			}
		});

	});


	return router;

}