module.exports = function(router) {

	let domainName = require('./config/domainName')()

	router.get('/', function (req, res) {
		return res.send({ error: true, message: 'hello' })
	});

	router.get('/login', function (req, res) {
		return res.render('pages/login', {domainName: domainName})
	});

	router.get('/profile', function (req, res) {
		return res.render('pages/profile', {domainName: domainName})
	});

	router.get('/tournaments', function (req, res) {
		return res.render('pages/tournaments', {domainName: domainName, status: req.query.status})
	});

	router.get('/games', function (req, res) {
		return res.render('pages/games', {domainName: domainName})
	});

	return router;
}