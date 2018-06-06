module.exports = function(router, db) {

	router.get('/getLeagues', function (req, res) {

		let status = req.query.status;
		let start = parseInt(req.query.start);
		let limit = parseInt(req.query.limit);
		if (!status) status = 'upcoming';
		if (!start) start = 0;
		if (!limit) limit = 10000;

		// TODO: CHANGE THIS :P
		let started = 0;
		if (status === 'ongoing') {
			started = 1;
		}
		//
		db.query('SELECT * FROM leagues WHERE started=? LIMIT ? OFFSET ?', [started, limit, start], function (error, results, fields) {
			if (error) throw error;
			return res.send({ error: false, data: results, message: 'List of leagues.' });
		});
	});

	// Create a new league
	router.post('/createLeague', function (req, res) {

		let name = req.body.name;
		let gamesPerPair = req.body.gamesPerPair;
		let startDate = req.body.startDate;
		let endDate = req.body.endDate;

		let admin = res.locals.username;
		let adminLevel = res.locals.adminLevel;

		if (adminLevel == 0) {
			return res.status(400).send({ error:true, message: 'You are not authorized to create a league.' });
		}

		if (!name) {
			return res.status(400).send({ error:true, message: 'Please provide league name.' });
		}

		// MAKE SURE DATE IS IN CORRECT FORMAT BRUH! :P
		// ALSO CHECK IF START DATE IS ON OR AFTER TODAY. AND END DATE IS ON OR AFTER START DATE.
		if (!startDate || !endDate) {
			return res.status(400).send({ error:true, message: 'Please provide valid start and end date.' });
		}

		if (!gamesPerPair) {
			gamesPerPair = 1;
		}

		// CHECK IF NAME UNIQUE
		// Done by db. But cath the error!

		db.query("INSERT INTO leagues SET ?", { name: name, admin: admin, gamesPerPair: gamesPerPair, startDate: startDate, endDate: endDate }, function (error, results, fields) {
			if (error) throw error;
			return res.send({ error: false, data: results, message: 'New league has been created successfully.' });
		});
	});

	return router;
}