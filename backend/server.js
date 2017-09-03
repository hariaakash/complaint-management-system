var express = require('express');
var app = express();
var fs = require('fs');
var path = require('path');
var rfs = require('rotating-file-stream');
var morgan = require('morgan');
var mysql = require('mysql');
var bodyParser = require('body-parser');
var cors = require('cors');
var conf = require('./conf');


conf.MYSQL(mysql, function (conn) {
	conf.MW(app, morgan, path, fs, rfs, cors);
	conf.ROUTES(app, conn);
});


app.listen(conf.PORT, conf.IP);
console.log('Server running on ' + conf.IP + ':' + conf.PORT);
