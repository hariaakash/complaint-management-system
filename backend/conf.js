module.exports = {
	IP: process.env.IP || '127.0.0.1',
	PORT: process.env.PORT || 3000,
	MYSQL: function (mysql, cb) {
		var connection = mysql.createConnection({
			host: 'localhost',
			user: 'root',
			password: ''
		});
		connection.connect();
		connection.query('CREATE DATABASE IF NOT EXISTS complaints', function (err) {
			if (err) throw err;
			connection.query('USE complaints', function (err) {
				if (err) throw err;
			});
		});
		cb(connection);
	},
	MW: function (app, morgan, path, fs, rfs, cors) {
		var logDirectory = path.join(__dirname, 'log');
		fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);
		var accessLogStream = rfs('access.log', {
			interval: '1d',
			path: logDirectory
		});
		app.use(morgan('common', {
			stream: accessLogStream
		}));
		app.use(morgan('dev'));
		app.use(cors());
	},
	ROUTES: function (app, conn) {
		var routes = require('./routes');
		routes(app, conn);
		app.get('/*', function (req, res) {
			res.json('hello');
		});
	}
};
