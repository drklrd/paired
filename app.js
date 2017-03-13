var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var app = express();



// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});



// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/bower_components', express.static(__dirname + '/bower_components'));

var server = app.listen(8848, function() {
  console.log('LISTENING on port 8848 ')
});


var io = require('socket.io')(server);

var users = {};


io.on('connection', function(socket) {
  var address = socket.handshake.address;
  console.log('Connected !', address);

  socket.on('newLogin', (user, room, color) => {
    if (!users[user + '_' + address + '_' + room + '_' + color]) {
      users[user + '_' + address + '_' + room + '_' + color] = socket;
    } else {
      users[user + '_' + address + '_' + room + '_' + color] = socket;
    }
    io.emit('currentonlineusers', Object.keys(users))
  });

  socket.on('disconnect', function() {

    for (var user in users) {
      if (users[user] === socket) {
        delete users[user];
      }
    }
    io.emit('currentonlineusers', Object.keys(users))

  });

})



var router = express.Router();
app.use('/', router);
require('./controllers')(router);



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;