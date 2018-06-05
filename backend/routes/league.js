module.exports = function(router, db) {

	// HELPER FUNCTIONS ------

	// GET APIS ----------------------------------------------------------------------------------------------------------------------
	// TODO: Make all these get function bodies use helper funtions (Might not work tho. Think.) :P
	// Get Participants
	router.get('/:leagueId/getParticipants', function (req, res) {

		let leagueId = req.params.leagueId;

		if (!leagueId) {
			return res.status(400).send({ error:true, message: 'Please enter valid league ID.' });
		}

		// CHECK IF LEAGUE EXISTS!

		db.query('SELECT username, rank FROM leagueParticipation WHERE leagueId=?', leagueId, function (error, results, fields) {
			if (error) throw error;
			return res.send({ error: false, data: results, message: 'List of Participants.' });
		});
	});


	// POST APIS ----------------------------------------------------------------------------------------------------------------------

	// Create a new league
	router.post('/createLeague', function (req, res) {

		let name = req.body.name;
		let gamesPerPair = req.body.gamesPerPair;

		let admin = res.locals.username;

		if (!name) {
			return res.status(400).send({ error:true, message: 'Please provide league name.' });
		}

		if (!gamesPerPair) {
			gamesPerPair = 1;
		}

		// CHECK IF NAME UNIQUE
		// Done by db. But cath the error!

		db.query("INSERT INTO leagues SET ?", { name: name, admin: admin, gamesPerPair: gamesPerPair }, function (error, results, fields) {
			if (error) throw error;
			return res.send({ error: false, data: results, message: 'New league has been created successfully.' });
		});
	});

	// Add player to league
	router.post('/:leagueId/addPlayer', function (req, res) {

		let leagueId = req.params.leagueId;
		let newuser = req.body.newuser;

		let username = res.locals.username;

		if (!leagueId) {
			return res.status(400).send({ error:true, message: 'Please enter valid league ID.' });
		}

		if (!newuser) {
			return res.status(400).send({ error:true, message: 'Please provide username to add.' });
		}

		db.query('SELECT admin, started FROM leagues WHERE id=?', leagueId, function (error, results, fields) {

			if (!results[0]) {
				return res.status(400).send({ error:true, message: 'This league ID doesn\'t exist.' });
			}

			if (results[0].admin !== username) {
				return res.status(400).send({ error:true, message: 'You are not authorized.' });
			}

			if (results[0].started) {
				return res.status(400).send({ error:true, message: 'League alerady started.' });
			}

		// CHECK IF USERNAME EXISTS!
		// CHECK IF USER ALREADY PART OF LEAGUE!
		// The above two are handeled by db design;)


			db.query("INSERT INTO leagueParticipation SET ?", { username: newuser, leagueId: leagueId }, function (error, results, fields) {
				if (error) throw error;
				return res.send({ error: false, data: results, message: 'User has been added successfully.' });
			});

		});

		
	});


	// Start the league
	//// Sets the status to started and generates the game records in db.
	router.post('/:leagueId/start', function (req, res) {

		let leagueId = req.params.leagueId;

		let username = res.locals.username;

		if (!leagueId) {
			return res.status(400).send({ error:true, message: 'Please enter valid league ID.' });
		}


		db.query('SELECT admin, started FROM leagues WHERE id=?', leagueId, function (error, results, fields) {

			if (!results[0]) {
				return res.status(400).send({ error:true, message: 'This league ID doesn\'t exist.' });
			}

			if (results[0].admin !== username) {
				return res.status(400).send({ error:true, message: 'You are not authorized.' });
			}

			if (results[0].started) {
				return res.status(400).send({ error:true, message: 'League alerady started.' });
			}

			db.query('SELECT gamesPerPair FROM leagues WHERE id=?', leagueId, function (error, results, fields) {
				if (error) throw error;
				gamesPerPair = results[0].gamesPerPair;

				db.query('SELECT username, rank FROM leagueParticipation WHERE leagueId=?', leagueId, function (error, results, fields) {
					if (error) throw error;

					playerList = []
					results.forEach(function (row) {
						// console.log(row.username);
						playerList.push(row.username)
					});

					/*for (i = 0; i < playerList.length - 1; i++) {
						for (j = i+1; j < playerList.length; j++) {
							for (gameNo = 1; gameNo <= gamesPerPair; gameNo++) {
								db.query("INSERT INTO leagueGames SET ?", { leagueId: leagueId, playerOne: playerList[i], playerTwo: playerList[j] }, function (error, results, fields) {
									if (error) throw error;
									console.log("Inserted Game.")
									// TODO: DELETE ALREADY INSERTED ROWS IF ERROR OCCURS. OTHERWISE IF THROWN IN THE MIDDLE, INCOMPLETE FIXTURES WILL BE INSERTED!.
									//return res.send({ error: false, data: results, message: 'User has been added successfully.' });
								});
							}
						}
					}*/

					insertGamesQuery = "INSERT INTO leagueGames (leagueId, playerOne, playerTwo) VALUES "
					for (i = 0; i < playerList.length - 1; i++) {
						for (j = i+1; j < playerList.length; j++) {
							for (gameNo = 1; gameNo <= gamesPerPair; gameNo++) {
								insertGamesQuery += "(" + leagueId + ", '" + playerList[i] + "', '" + playerList[j] + "')"

								if (!(i==playerList.length-2 && j==playerList.length-1 && gameNo==gamesPerPair)) {
									insertGamesQuery += ", "
								}
							}
						}
					}

					// console.log(insertGamesQuery);
					
					db.query(insertGamesQuery, function (error, results, fields) {
						if (error) throw error;
						console.log("Inserted Games.")

						db.query('UPDATE leagues SET started = 1 WHERE id = ?', leagueId, function (error, results, fields) {
							if (error) throw error;
							console.log("League Started.")

							return res.send({ error: false, message: "League has been started successfully." });
						});
					});
				});
			});
		});
	});

	return router;
}