var helpers = require('../helpers');
var client = helpers.client;
var moment = helpers.moment;
var crypto = helpers.crypto;
/*
 * GET home page.
 */

exports.index = function(req, res){
  if (req.session.username) {
    res.redirect('/todo');
    return;
  };
  var login_username = req.session.login_username;
  req.session.login_username = null;
  res.render('index', {
    title: 'Todo',
    message: req.flash('login'),
    login_username: login_username
  });
};

exports.about = function(req, res) {
  res.render('index', { 
    title: 'About'
  });
};

exports.todo = function(req, res){
  var todos = {};
  client.hget("Users", req.session.username, function(err,userStr) {
    var user = JSON.parse(userStr);
    client.hgetall("Todo:"+req.session.username, function(err, objs) {
      for(var k in objs) {
        var newTodo = JSON.parse(objs[k]);
        if (todos[newTodo.status] == undefined) {
          todos[newTodo.status] = [];
        };
        newTodo.dateCreated = new Date(newTodo.dateCreated);
        newTodo.momentCreated = moment(newTodo.dateCreated).format("MM-DD-YYYY at h:mm:ss a");
        if (newTodo.dateCompleted != undefined) {
          newTodo.dateCompleted = new Date(newTodo.dateCompleted);
          newTodo.momentCompleted = moment(newTodo.dateCompleted).format("MM-DD-YYYY at h:mm:ss a");
        };
        todos[newTodo.status].push(newTodo);
      }
      // Create sorted list
      var sortedTodos = {};
      if (todos['Pending'] != undefined) {
        sortedTodos['Pending'] = todos['Pending'].sort(function (a, b) {
          if (a.dateCreated == b.dateCreated) {
            return 0;
          };
          return a.dateCreated > b.dateCreated;
        });
      };
      if (todos['Done'] != undefined) {
        sortedTodos['Done'] = todos['Done'].sort(function (a, b) {
          if (a.dateCompleted == b.dateCompleted) {
            return 0;
          };
          return a.dateCompleted < b.dateCompleted
        });
      };
      res.render('todo', {
        title: 'Todo&nbsp;List',
        todos: sortedTodos,
        username: req.session.username,
        firstname: user.firstname,
        lastname: user.lastname,
        message: req.flash('action')
      });
    });
  });
};

exports.saveTodo = function(req, res) {
  var newTodo = {};
  newTodo.name = req.body['todo-text'];
  newTodo.status = 'Pending';
  newTodo.dateCreated = Date();
  newTodo.id = newTodo.name.replace(/\s/g, "-")+':'+newTodo.dateCreated;
  var newTodoStr = JSON.stringify(newTodo);
  client.hset("Todo:"+req.session.username, newTodo.id, newTodoStr);
  req.flash('action', 'Created new todo.');
  res.redirect("back");
};

exports.updateTodo = function(req, res) {
  var updateId = req.body['update-id'];
  if (req.body['done'] != undefined) {
    req.flash('action', 'Completed todo.');
    client.hget("Todo:"+req.session.username, updateId, function(err, obj) {
      var todo = JSON.parse(obj);
      todo.status = "Done";
      todo.dateCompleted = new Date();
      var todoStr = JSON.stringify(todo);
      client.hset("Todo:"+req.session.username, todo.id, todoStr);
    });
  } else if (req.body['delete'] != undefined) {
    req.flash('action', 'Deleted todo.');
    client.hdel("Todo:"+req.session.username, updateId);
  }
  res.redirect("back");
};