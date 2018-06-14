module.exports = function(router, db) {

	const xss = require('xss');

	router.get('/getLeagues', function (req, res) {

		let status = req.query.status;
		let start = parseInt(req.query.start);
		let limit = parseInt(req.query.limit);
		if (!status) status = 'upcoming';
		if (!start) start = 0;
		if (!limit || limit > 1000) limit = 1000;

		var qry="";
		switch (status) {
			case 'archived':
				qry = 'SELECT * FROM leagues WHERE endDate < CURRENT_DATE LIMIT ? OFFSET ?';
				break;
			case 'ongoing':
				qry = 'SELECT * FROM leagues WHERE endDate >= CURRENT_DATE AND startDate < CURRENT_DATE LIMIT ? OFFSET ?';
				break;
			case 'upcoming':
			default:
				qry = 'SELECT * FROM leagues WHERE startDate >= CURRENT_DATE LIMIT ? OFFSET ?';
		}

		db.query(qry, [limit, start], function (error, results, fields) {
			if (error) throw error;
			return res.send({ error: false, data: results, message: 'List of leagues.' });
		});
	});

	// Create a new league
	router.post('/createLeague', function (req, res) {

		let name = xss(req.body.name);
		let gamesPerPair = req.body.gamesPerPair;
		let startDate = new Date(req.body.startDate);
		let endDate = new Date(req.body.endDate);

		let admin = res.locals.username;
		let adminLevel = res.locals.adminLevel;

		if (adminLevel == 0) {
			return res.send({ error:true, message: 'You are not authorized to create a league.' });
		}

		if (!name) {
			return res.send({ error:true, message: 'Please provide league name.' });
		}

		// MAKE SURE DATE IS IN CORRECT FORMAT BRUH! :P
		// ALSO CHECK IF START DATE IS ON OR AFTER TODAY. AND END DATE IS ON OR AFTER START DATE.
		if (!startDate || !endDate) {
			return res.send({ error:true, message: 'Please provide valid start and end date.' });
		}
		if (compareDates(startDate,endDate)==1) {
			return res.send({ error:true, message: 'End date has to be on or after Start date.' });
		}
		if(compareDates(startDate,new Date())==-1) {
			return res.send({ error:true, message: 'Start date cannot be in the past.' });
		}


		if (!gamesPerPair) {
			gamesPerPair = 1;
		} else {
			if (isNaN(gamesPerPair)) {
				return res.send({ error:true, message: 'Number of rounds should be an integer.' });
			}
			gamesPerPair = parseInt(gamesPerPair);
		}

		// CHECK IF NAME UNIQUE
		// Done by db. But cath the error!
		
		db.query("INSERT INTO leagues SET ?", { name: name, admin: admin, gamesPerPair: gamesPerPair, startDate: startDate, endDate: endDate }, function (error, results, fields) {
			if (error) throw error;
			return res.send({ error: false, data: results, message: 'New league has been created successfully.' });
		});
	});

	// returns -1, 0, 1 for <, ==, >
	function compareDates(d1, d2) {
		if(d1.getYear()<d2.getYear()) return -1;
		if(d1.getYear()>d2.getYear()) return 1;
		else {
			if(d1.getMonth()<d2.getMonth()) return -1;
			if(d1.getMonth()>d2.getMonth()) return 1;
			else {
				if(d1.getDate()<d2.getDate()) return -1;
				if(d1.getDate()>d2.getDate()) return 1;
				else return 0;
			}

		}
		

	}

	return router;
}