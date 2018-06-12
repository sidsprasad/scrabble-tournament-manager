module.exports = function(mainRouter, mysql, mysqlCreds) {

	const db = mysql.createConnection({
	    host: mysqlCreds.host,
	    user: mysqlCreds.user,
	    password: mysqlCreds.password,
	    database: mysqlCreds.database
	});
	db.connect();

	var router = require('express').Router();

	var auth = require('./routes/auth')(router, db);
	var profile = require('./routes/profile')(router, db);
	var leagues = require('./routes/leagues')(router, db);
	var league = require('./routes/league')(router, db);
	var games = require('./routes/games')(router, db);

	mainRouter.use('/auth', auth);
	mainRouter.use('/profile', profile);
	mainRouter.use('/leagues', leagues);
	mainRouter.use('/league', league);
	mainRouter.use('/games', games)

	return mainRouter;
}