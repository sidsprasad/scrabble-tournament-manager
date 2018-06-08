module.exports = function(router) {


	router.get('/', function (req, res) {
		return res.send({ error: true, message: 'hello' })
	});

	router.get('/login', function (req, res) {
		return res.render('pages/login')
	});

	router.get('/profile', function (req, res) {
		return res.render('pages/profile')
	});

	router.get('/tournaments', function (req, res) {
		return res.render('pages/tournaments', {status: req.query.status})
	});

	router.get('/games', function (req, res) {
		return res.render('pages/games', {status: req.query.status})
	});

	return router;
}