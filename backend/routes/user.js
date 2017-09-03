module.exports = function (conn) {
	var express = require('express');
	var app = express();
	var bodyParser = require('body-parser');
	var hat = require('hat');
	var bcrypt = require('bcryptjs');


	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({
		extended: true
	}));


	conn.query('USE complaints',
		function (err) {
			if (err) throw err;
			var table = 'CREATE TABLE IF NOT EXISTS users (id INT NOT NULL AUTO_INCREMENT, PRIMARY KEY(id), email VARCHAR(30) UNIQUE, password VARCHAR(100), authkey VARCHAR(100))';
			conn.query(table, function (err) {
				if (err) throw err;
			});
			table = 'CREATE TABLE IF NOT EXISTS admin (id INT NOT NULL AUTO_INCREMENT, PRIMARY KEY(id), email VARCHAR(30) UNIQUE, password VARCHAR(100), authkey VARCHAR(100))';
			conn.query(table, function (err) {
				if (err) throw err;
			});
			table = 'CREATE TABLE IF NOT EXISTS category (id INT NOT NULL AUTO_INCREMENT, PRIMARY KEY(id), name VARCHAR(30), des VARCHAR(100))';
			conn.query(table, function (err) {
				if (err) throw err;
			});
			table = 'CREATE TABLE IF NOT EXISTS subcategory (id INT NOT NULL AUTO_INCREMENT, PRIMARY KEY(id), cid INT NOT NULL, FOREIGN KEY(cid) REFERENCES category(id), name VARCHAR(30), des VARCHAR(100))';
			conn.query(table, function (err) {
				if (err) throw err;
			});
			table = 'CREATE TABLE IF NOT EXISTS complaints (id INT NOT NULL AUTO_INCREMENT, PRIMARY KEY(id), sid INT NOT NULL, FOREIGN KEY(sid) REFERENCES subcategory(id), uid INT NOT NULL, FOREIGN KEY(uid) REFERENCES users(id), title VARCHAR(30), des VARCHAR(100), status INT DEFAULT 0, latestreply INT DEFAULT 0)';
			conn.query(table, function (err) {
				if (err) throw err;
			});
			table = 'CREATE TABLE IF NOT EXISTS conversations (id INT NOT NULL AUTO_INCREMENT, PRIMARY KEY(id), cid INT NOT NULL, FOREIGN KEY(cid) REFERENCES complaints(id), msg VARCHAR(100), repliedby INT DEFAULT 0, time INT)';
			conn.query(table, function (err) {
				if (err) throw err;
			});
			bcrypt.hash('password', 10, function (err, hash) {
				table = 'INSERT INTO admin(email, password) VALUES ("smgdark@gmail.com","' + hash + '")';
				conn.query(table, function (err) {
					if (err) console.log('Admin already exists')
				});
			});
		});


	function uniQ(sql, cb) {
		conn.query(sql, function (err, results) {
			cb(err, results)
		});
	}

	function uniR(res, status, msg) {
		res.json({
			status: status,
			msg: msg
		});
	}

	app.get('/', function (req, res) {
		if (req.query.authkey) {
			var sql = 'SELECT id,email FROM users WHERE authkey = "' + req.query.authkey + '"';
			uniQ(sql, function (err, result) {
				if (err || !result[0]) {
					console.log(err)
					uniR(res, false, 'User not found')
				} else if (result[0]) {
					sql = 'SELECT * FROM complaints WHERE uid = ' + result[0].id;
					var data = {};
					data.email = result[0].email;
					uniQ(sql, function (err, result) {
						if (err) {
							uniR(res, false, 'Some error occurred !!');
						} else {
							data.complaints = result.reverse()
							res.json({
								status: true,
								data: data
							});
						}
					});
				}
			});
		} else {
			uniR(res, false, 'Invalid entry')
		}
	});

	app.get('/categories', function (req, res) {
		var sql = 'SELECT category.name as cname, category.id as cid, subcategory.name as sname, subcategory.id as sid from category INNER JOIN subcategory WHERE CATEGORY.ID = SUBCATEGORY.CID';
		uniQ(sql, function (err, result) {
			if (err) {
				res.json({
					status: false,
					msg: 'Error',
					data: err
				})
			} else {
				var data = [];
				for (i = 0; i < result.length; i++) {
					data.push({
						id: result[i].cid,
						name: result[i].cname
					});
				}
				data = data.filter((x, i) => {
					if (data.indexOf(x.id) < 0) {
						data.push(x.id);
						return true;
					}
					return false;
				});
				for (j = 0; j < data.length; j++) {
					data[j].sc = []
					for (i = 0; i < result.length; i++) {
						if (result[i].cid == data[j].id) {
							data[j]["sc"].push({
								id: result[i].sid,
								cid: result[i].cid,
								name: result[i].sname
							})
						}
					}
				}
				console.log(data)
				res.json({
					status: true,
					data: data
				})
			}
		});
	});

	app.get('/complaint', function (req, res) {
		if (req.query.authkey && req.query.cid) {
			var sql = 'SELECT id FROM users WHERE authkey = "' + req.query.authkey + '"';
			uniQ(sql, function (err, result) {
				if (err || !result[0]) {
					console.log(err)
					uniR(res, false, 'User not found')
				} else if (result[0]) {
					sql = 'SELECT * FROM conversations WHERE cid = ' + req.query.cid;
					uniQ(sql, function (err, result) {
						if (err) {
							uniR(res, false, 'Some error occurred !!');
						} else {
							var conversations = result;
							sql = 'SELECT title, des, sid, status FROM complaints WHERE id = ' + req.query.cid;
							uniQ(sql, function (err, result) {
								if (err) {
									uniR(res, false, 'Some error occurred !!');
								} else {
									var data = result[0];
									data.conv = conversations;
									sql = 'SELECT name FROM subcategory WHERE id = ' + result[0].sid;
									uniQ(sql, function (err, result) {
										if (err) {
											uniR(res, false, 'Some error occurred !!');
										} else {
											data.sc = result[0].name;
											res.json({
												status: true,
												data: data
											});
										}
									});
								}
							});
						}
					});
				}
			});
		} else {
			uniR(res, false, 'Invalid entry')
		}
	});

	app.post('/register', function (req, res) {
		if (req.body.email && req.body.password) {
			bcrypt.hash(req.body.password, 10, function (err, hash) {
				var sql = 'INSERT INTO users(email, password) VALUES ("' + req.body.email + '","' + hash + '")';
				uniQ(sql, function (err, result) {
					if (err)
						uniR(res, false, 'User already registered !!')
					else
						uniR(res, true, 'Registered successfully !!')
				});
			});
		} else {
			uniR(res, false, 'Invalid entry')
		}
	});

	app.post('/login', function (req, res) {
		if (req.body.email && req.body.password) {
			var sql = 'SELECT password FROM users WHERE email = "' + req.body.email + '"';
			uniQ(sql, function (err, result) {
				if (err || !result[0]) {
					console.log(err)
					uniR(res, false, 'User not found')
				} else if (result[0]) {
					bcrypt.compare(req.body.password, result[0].password, function (err, resp) {
						if (resp == true) {
							var key = hat();
							var sql = 'UPDATE users SET authkey = "' + key + '" WHERE email = "' + req.body.email + '"';
							uniQ(sql, function (err, result) {
								if (err) {
									console.log(err)
									uniR(res, false, 'Query err')
								} else {
									res.json({
										status: true,
										msg: 'Logged in successfully !!',
										authkey: key
									});
								}
							});
						} else {
							uniR(res, false, 'Entered password is wrong !!');
						}
					});
				}
			});
		} else {
			uniR(res, false, 'Invalid entry')
		}
	});

	app.post('/createComplaint', function (req, res) {
		if (req.body.authkey && req.body.title && req.body.des && req.body.sid) {
			var sql = 'SELECT id FROM users WHERE authkey = "' + req.body.authkey + '"';
			uniQ(sql, function (err, result) {
				if (err || !result[0]) {
					console.log(err)
					uniR(res, false, 'User not found')
				} else if (result[0]) {
					sql = 'INSERT INTO complaints(sid, uid, title, des, status) VALUES(' + req.body.sid + ',' + result[0].id + ',"' + req.body.title + '","' + req.body.des + '",0' + ')';
					uniQ(sql, function (err, result) {
						if (err) {
							uniR(res, false, 'Some error occurred !!');
						} else
							uniR(res, true, 'Added complaint !!')
					});
				}
			});
		} else {
			uniR(res, false, 'Invalid entry')
		}
	});

	app.post('/complaintReply', function (req, res) {
		if (req.body.authkey && req.body.cid && req.body.msg) {
			var sql = 'SELECT id FROM users WHERE authkey = "' + req.body.authkey + '"';
			uniQ(sql, function (err, result) {
				if (err || !result[0]) {
					console.log(err)
					uniR(res, false, 'User not found')
				} else if (result[0]) {
					var date = new Date();
					sql = 'INSERT INTO conversations(cid, time, msg) VALUES(' + req.body.cid + ',' + (Math.round(date.getTime() / 1000) + date.getTimezoneOffset() * 60) + ',"' + req.body.msg + '")';
					uniQ(sql, function (err, result) {
						if (err) {
							uniR(res, false, 'Some error occurred !!');
						} else {
							sql = 'UPDATE complaints SET latestreply = 0 WHERE id = "' + req.body.cid + '"';
							uniQ(sql, function (err, result) {
								if (err) {
									uniR(res, false, 'Some error occurred !!');
								} else {
									uniR(res, true, 'Reply successfull !!')
								}
							});
						}
					});
				}
			});
		} else {
			uniR(res, false, 'Invalid entry')
		}
	});


	return app;
};
