
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes/routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path')
  , flash = require('connect-flash');
var app = express();

app.configure(function(){
  app.use(express.cookieParser('jgtodos'));
  app.use(express.session({
    secret: 'jgtodos',
    cookie: { 
      maxAge: new Date(Date.now() + 3600000 * 168) 
    }
  }));
  app.use(flash());
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon(__dirname + '/public/favicon.ico'));
  app.use(express.logger('dev'));
  app.use(express.compress());
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', routes.index);
app.post('/login', user.login);
app.get('/signup', user.signup);
app.post('/newUser', user.newUser);
app.get('/logout', user.logout);
app.get('/deleteUser', checkAuth, user.deleteUser);
app.get('/about', routes.about);
app.get('/todo', checkAuth, routes.todo);
app.post('/save', checkAuth, routes.saveTodo);
app.post('/update', checkAuth, routes.updateTodo);
app.get('/users', user.list);

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

function checkAuth(req, res, next) {
  if (!req.session.username) {
    req.flash('login','Please login.');
    res.redirect('/');
  } else {
    next();
  }
}