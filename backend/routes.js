module.exports = function(app, mysql) {

	const db = mysql.createConnection({
	    host: 'localhost',
	    user: 'root',
	    password: 'root',
	    database: 'ScrabbleTournaments'
	});
	db.connect();

	require('./routes/auth')(app, db);
	require('./routes/leagues')(app, db);
	require('./routes/games')(app, db);

}