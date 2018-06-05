module.exports = function(mainRouter, mysql) {

	const db = mysql.createConnection({
	    host: 'localhost',
	    user: 'root',
	    password: 'root',
	    database: 'ScrabbleTournaments'
	});
	db.connect();

	var router = require('express').Router();

	var auth = require('./routes/auth')(router, db);
	var leagues = require('./routes/leagues')(router, db);
	var league = require('./routes/league')(router, db);
	//var games = require('./routes/games')(router, db);

	mainRouter.use('/auth', auth);
	mainRouter.use('/leagues', leagues);
	mainRouter.use('/league', league);
	//app.use('/game', games)

	return mainRouter;
}