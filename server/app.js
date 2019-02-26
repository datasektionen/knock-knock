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

var loginAuthPls = (req, res, next) => {
  if(noAuthPaths.includes(req.path)) {
    next()
    return
  }
  if(req.query.token) {
    fetch('https://login2.datasektionen.se/verify/' + req.query.token + "?format=json&api_key=" + process.env.LOGIN2_API_KEY)
    .then(x => x.json())
    .catch(e => next(new Error('Authentication error from login')))
    .then(x => {
      console.log('User ' + x.first_name + ' ' + x.last_name + ' (' + x.user + ') authenticated')
      fetch('https://pls.datasektionen.se/api/user/' + x.user + '/knockknock')
      .then(response => response.json())
      .then(json => {
        if(!json.includes('admin')) {
          res.staus(403)
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
    }).catch(e => next(new Error('Authentication error from after pls-fetch')))
  } else if(req.query.api_key){
    fetch('https://pls.datasektionen.se/api/token/' + req.body.key + '/knockknock')
      .then(response => response.json())
      .then(json => {
        if(!json.includes('admin')) {
          res.staus(403)
          res.send("Forbidden")
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
  } else {
      console.log("No access, no auth")
      res.status(401)
      res.send("Forbidden")
  }
}
  
  
// COMMENT AWAY ROW BELOW TO SKIP AUTH FOR DEV, otherwise you need a token
app.all('/api/*', loginAuthPls);

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
