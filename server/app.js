var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var bodyParser = require('body-parser');
var fetch = require('node-fetch');
var cors = require('cors')

var apiRoutes = require('./routes/apiRoutes');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(cors())
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


var noAuthPaths = ['/api/getSMInSession', '/api/getAllMembersInside', '/api/getAllMembersOfSm', '/api/getAllSM', '/api/isCheckedIn', '/api/knock-knock', '/api/getAllSMInUt']


var pls_check = (req, res, next) => {
  if(noAuthPaths.includes(req.path)) {
    next()
    return
  }
  fetch('https://pls.datasektionen.se/api/token/' + req.body.key + '/knockknock')
    .then(response => response.json())
    .then(json => {
      if(!json.includes('admin')) {
        res.staus(401)
        res.send("No access, must have correct rights.")
        return
      } else {
        next()
        return
      }
    }).catch(err => {
      console.log('fetch error', err);
      res.status(500)
      res.send(err)
      return
    });
};


app.all('/api/*', pls_check);
app.use('/api', apiRoutes);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
