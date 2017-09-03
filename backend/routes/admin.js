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
		if (req.query.adminkey) {
			var sql = 'SELECT id FROM admin WHERE authkey = "' + req.query.adminkey + '"';
			uniQ(sql, function (err, result) {
				if (err || !result[0]) {
					console.log(err)
					uniR(res, false, 'User not found')
				} else if (result[0]) {
					sql = 'SELECT id, email FROM users';
					uniQ(sql, function (err, result) {
						if (err) {
							uniR(res, false, 'Some error occurred !!');
						} else {
							var users = JSON.parse(JSON.stringify(result));
							for (var i = 0; i < users.length; i++) {
								(function (i) {
									sql = 'SELECT count(*) FROM complaints WHERE status = 0 AND uid = ' + users[i].id;
									uniQ(sql, function (err, result) {
										if (err) {
											uniR(res, false, 'Some error occurred !!');
										} else {
											users[i].complaints = result[0]['count(*)'];
											if (i == users.length - 1)
												res.json({
													status: true,
													data: users
												});
										}
									});
								})(i);
							}
						}
					});
				}
			});
		} else {
			uniR(res, false, 'Invalid entry')
		}
	});

	app.get('/user', function (req, res) {
		if (req.query.adminkey && req.query.uid) {
			var sql = 'SELECT id FROM admin WHERE authkey = "' + req.query.adminkey + '"';
			uniQ(sql, function (err, result) {
				if (err || !result[0]) {
					console.log(err)
					uniR(res, false, 'User not found')
				} else if (result[0]) {
					sql = 'SELECT id, email FROM users WHERE id = ' + req.query.uid;
					uniQ(sql, function (err, result) {
						if (err) {
							uniR(res, false, 'Some error occurred !!');
						} else {
							sql = 'SELECT * FROM complaints WHERE uid = ' + result[0].id;
							var data = {};
							data.email = result[0].email;
							uniQ(sql, function (err, result) {
								if (err) {
									uniR(res, false, 'Some error occurred !!');
								} else {
									data.complaints = result
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
		} else {
			uniR(res, false, 'Invalid entry')
		}
	});

	app.get('/complaint', function (req, res) {
		if (req.query.adminkey && req.query.cid) {
			var sql = 'SELECT id FROM admin WHERE authkey = "' + req.query.adminkey + '"';
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
							sql = 'SELECT uid, title, des, sid, status FROM complaints WHERE id = ' + req.query.cid;
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

	app.post('/login', function (req, res) {
		if (req.body.email && req.body.password) {
			var sql = 'SELECT password FROM admin WHERE email = "' + req.body.email + '"';
			uniQ(sql, function (err, result) {
				if (err || !result[0]) {
					console.log(err)
					uniR(res, false, 'User not found')
				} else if (result[0]) {
					bcrypt.compare(req.body.password, result[0].password, function (err, resp) {
						if (resp == true) {
							var key = hat();
							var sql = 'UPDATE admin SET authkey = "' + key + '" WHERE email = "' + req.body.email + '"';
							uniQ(sql, function (err, result) {
								if (err) {
									console.log(err)
									uniR(res, false, 'Query err')
								} else {
									res.json({
										status: true,
										msg: 'Logged in successfully !!',
										adminkey: key
									})
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

	app.post('/addCategory', function (req, res) {
		if (req.body.adminkey && req.body.name && req.body.des) {
			var sql = 'SELECT id FROM admin WHERE authkey = "' + req.body.adminkey + '"';
			uniQ(sql, function (err, result) {
				if (err || !result[0]) {
					console.log(err)
					uniR(res, false, 'User not found')
				} else if (result[0]) {
					sql = 'INSERT INTO category(name, des) VALUES("' + req.body.name + '","' + req.body.des + '")';
					uniQ(sql, function (err, result) {
						if (err) {
							uniR(res, false, 'Some error occurred !!');
						} else
							uniR(res, true, 'Added category !!')
					});
				}
			});
		} else {
			uniR(res, false, 'Invalid entry')
		}
	});

	app.post('/delCategory', function (req, res) {
		if (req.body.adminkey && req.body.cid) {
			var sql = 'SELECT id FROM admin WHERE authkey = "' + req.body.adminkey + '"';
			uniQ(sql, function (err, result) {
				if (err || !result[0]) {
					console.log(err)
					uniR(res, false, 'User not found')
				} else if (result[0]) {
					sql = 'DELETE FROM category WHERE id = ' + req.body.cid;
					uniQ(sql, function (err, result) {
						if (err) {
							uniR(res, false, 'Some error occurred !!');
						} else {
							sql = 'DELETE FROM subcategory WHERE cid = ' + req.body.cid;
							uniQ(sql, function (err, result) {
								if (err) {
									uniR(res, false, 'Some error occurred !!');
								} else {
									uniR(res, true, 'Removed category !!')
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

	app.post('/addSubCategory', function (req, res) {
		if (req.body.adminkey && req.body.cid && req.body.name && req.body.des) {
			var sql = 'SELECT id FROM admin WHERE authkey = "' + req.body.adminkey + '"';
			uniQ(sql, function (err, result) {
				if (err || !result[0]) {
					console.log(err)
					uniR(res, false, 'User not found')
				} else if (result[0]) {
					sql = 'INSERT INTO subcategory(name, des, cid) VALUES("' + req.body.name + '","' + req.body.des + '",' + req.body.cid + ')';
					uniQ(sql, function (err, result) {
						if (err) {
							uniR(res, false, 'Some error occurred !!');
						} else
							uniR(res, true, 'Added subcategory !!')
					});
				}
			});
		} else {
			uniR(res, false, 'Invalid entry')
		}
	});

	app.post('/delSubCategory', function (req, res) {
		if (req.body.adminkey && req.body.sid) {
			var sql = 'SELECT id FROM admin WHERE authkey = "' + req.body.adminkey + '"';
			uniQ(sql, function (err, result) {
				if (err || !result[0]) {
					console.log(err)
					uniR(res, false, 'User not found')
				} else if (result[0]) {
					sql = 'DELETE FROM subcategory WHERE id = ' + req.body.sid;
					uniQ(sql, function (err, result) {
						if (err) {
							uniR(res, false, 'Some error occurred !!');
						} else
							uniR(res, true, 'Removed subcategory !!')
					});
				}
			});
		} else {
			uniR(res, false, 'Invalid entry')
		}
	});

	app.post('/complaintReply', function (req, res) {
		if (req.body.adminkey && req.body.cid && req.body.msg) {
			var sql = 'SELECT id FROM admin WHERE authkey = "' + req.body.adminkey + '"';
			uniQ(sql, function (err, result) {
				if (err || !result[0]) {
					console.log(err)
					uniR(res, false, 'User not found')
				} else if (result[0]) {
					var date = new Date();
					sql = 'INSERT INTO conversations(cid, repliedby, time, msg) VALUES(' + req.body.cid + ',' + 1 + ',' + (Math.round(date.getTime() / 1000) + date.getTimezoneOffset() * 60) + ',"' + req.body.msg + '")';
					uniQ(sql, function (err, result) {
						if (err) {
							uniR(res, false, 'Some error occurred !!');
						} else {
							sql = 'UPDATE complaints SET latestreply = 1 WHERE id = "' + req.body.cid + '"';
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

	app.post('/complaintClose', function (req, res) {
		if (req.body.adminkey && req.body.cid) {
			var sql = 'SELECT id FROM admin WHERE authkey = "' + req.body.adminkey + '"';
			uniQ(sql, function (err, result) {
				if (err || !result[0]) {
					console.log(err)
					uniR(res, false, 'User not found')
				} else if (result[0]) {
					var date = new Date();
					sql = 'UPDATE complaints SET status = 1 WHERE id = ' + req.body.cid;
					uniQ(sql, function (err, result) {
						if (err) {
							uniR(res, false, 'Some error occurred !!');
						} else {
							uniR(res, true, 'Complaint closed !!');
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
