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

	return router;
}