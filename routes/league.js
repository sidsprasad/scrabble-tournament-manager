module.exports = function(router, db) {

	// HELPER FUNCTIONS ------

	// GET APIS ----------------------------------------------------------------------------------------------------------------------
	// TODO: Make all these get function bodies use helper funtions (Might not work tho. Think.) :P
	// Get Participants
	router.get('/:leagueId/getLeaderboard', function (req, res) {

		let leagueId = req.params.leagueId;

		if (!leagueId) {
			return res.send({ error:true, message: 'Please enter valid league ID.' });
		}

		// CHECK IF LEAGUE EXISTS!

		db.query('SELECT * FROM leagueLeaderboards WHERE leagueId=?', leagueId, function (error, results, fields) {
			if (error) throw error;
			return res.send({ error: false, data: results, message: 'League Leaderboard.' });
		});
	});


	// POST APIS ----------------------------------------------------------------------------------------------------------------------

	// Add player to league
	// Also adds game records. 'gamesPerPair' number of games b/w new player and each of the already added players.
	router.post('/:leagueId/addPlayer', function (req, res) {

		let leagueId = req.params.leagueId;
		let newuser = req.body.username;

		let adderUsername = res.locals.username;
		let adderAdminLevel = res.locals.adminLevel;

		if (!leagueId) {
			return res.send({ error:true, message: 'Please enter valid league ID.' });
		}

		if (!newuser) {
			return res.send({ error:true, message: 'Please provide username to add.' });
		}


		db.query('SELECT admin, gamesPerPair FROM leagues WHERE id=?', leagueId, function (error, results, fields) {
			if (error) throw error;

			if (!results[0]) {
				return res.send({ error:true, message: 'This league ID doesn\'t exist.' });
			}

			if (adderAdminLevel != 2 && results[0].admin !== adderUsername) {
				return res.send({ error:true, message: 'You are not authorized.' });
			}

			gamesPerPair = results[0].gamesPerPair;

		// CHECK IF USERNAME EXISTS!
		// CHECK IF USER ALREADY PART OF LEAGUE!
		// The above two are handeled by db design;)

			db.beginTransaction(function(error) {
				if (error) throw error;

				db.query('SELECT * FROM leagueParticipation WHERE leagueId=?', leagueId, function (error, results, fields) {
					if (error) {
						db.rollback(function() {
							throw error;
						});
					}
					playerList = []
					results.forEach(function (row) {
						// console.log(row.username);
						playerList.push(row.username)
					});
					// return res.send({ error: false, data: results, message: 'User has been added successfully.' });

					db.query("INSERT INTO leagueParticipation SET ?", { username: newuser, leagueId: leagueId }, function (error, results, fields) {
						if (error) {
							db.rollback(function() {
								throw error;
							});
						}
						console.log("Added participant.")
						
						if (playerList.length < 1) {
							return res.send({ error: false, message: "Player added successfully." });
						}

						insertGamesQuery = "INSERT INTO leagueGames (leagueId, playerOne, playerTwo, label) VALUES "
						for (i = 0; i < playerList.length; i++) {
							if (playerList[i] == newuser) continue;
							for (gameNo = 1; gameNo <= gamesPerPair; gameNo++) {
								insertGamesQuery += "(" + leagueId + ", '" + playerList[i] + "', '" + newuser + "', 'Game "+gameNo+" of "+gamesPerPair+"')";

								if (!(i==playerList.length-1 && gameNo==gamesPerPair)) {
									insertGamesQuery += ", ";
								}
							}
						}

						// console.log(insertGamesQuery);
						db.query(insertGamesQuery, function (error, results, fields) {
							if (error) {
								db.rollback(function() {
									throw error;
								});
							}
							db.query("UPDATE leagues SET noOfPlayers = noOfPlayers + 1 WHERE id = ?", leagueId, function (error, results, fields) {
								if (error) {
									db.rollback(function() {
										throw error;
									});
								}
								db.commit(function(error) {
									if (error) { 
										connection.rollback(function() {
											throw error;
										});
									}
									console.log("Inserted Games.")
									return res.send({ error: false, message: "Player and his games added successfully." });
								});
							});

						});

					});
				});

			});
		});
	});

	return router;
}