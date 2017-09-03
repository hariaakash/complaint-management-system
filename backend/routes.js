module.exports = function (app, conn) {
	// Require Routes
	var user = require('./routes/user')(conn);
	var admin = require('./routes/admin')(conn);

	// Use Routes
	app.use('/user', user);
	app.use('/admin', admin);
};
