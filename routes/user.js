var helpers = require('../helpers');
var client = helpers.client;
var crypto = helpers.crypto;
/*
 * GET users listing.
 */

exports.list = function(req, res){
  res.send("respond with a resource");
};

exports.login = function(req, res){
  var username = req.body.username;
  if (!username) {
    req.flash('login', 'You must enter a username.');
    res.redirect("back");
    return;
  };
  var password = req.body.password;
  if (!password) {
    req.flash('login', 'You must enter a password.');
    res.redirect("back");
    return;
  };
  // Check if user exists, if not offer to create it
  client.hexists("Users", username, function(err, exists) {
    if (!exists) {
      req.session.new_username = username;
      req.session.new_password = password;
      res.redirect("/signup");
      return;
    };
    // Pull user
    client.hget("Users", username, function(err,userStr) {
      var user = JSON.parse(userStr);
      var password_hash = crypto.createHash('md5').update(password).digest();
      if (user.password_hash != password_hash) {
        req.session.login_username = username;
        req.flash('login', 'Incorrect password entered.');
        res.redirect("back");
        return;
      };
      // Password was correct, store the username as a session variable
      req.session.username = username;
      // redirect the user to todos
      res.redirect('/todo');
    });
  });
};


exports.signup = function(req, res){
  var new_username = req.session.new_username || '';
  var new_password = req.session.new_password || '';
  res.render('index', {
    title: 'Signup',
    new_username: new_username,
    new_password: new_password,
    message: req.flash('signup')
  });
};

exports.newUser = function(req, res){
  // Verify username
  var username = req.body.username;
  if (!username) {
    req.flash('signup', 'You must enter a Username.');
    res.redirect("back");
    return;
  };
  // Verify firstname
  var firstname = req.body.firstname;
  if (!firstname) {
    req.flash('signup', 'You must enter a Firstname.');
    res.redirect("back");
    return;
  };
  // Verify lastname
  var lastname = req.body.lastname;
  if (!lastname) {
    req.flash('signup', 'You must enter a Lastname.');
    res.redirect("back");
    return;
  };
  // Verify password
  var password = req.body.password;
  if (!password) {
    req.flash('signup', 'You must enter a Password.');
    res.redirect("back");
    return;
  };
  var verify_password = req.body.verify_password;
  if (!verify_password) {
    req.flash('signup', 'You must verify your Password.');
    res.redirect("back");
    return;
  };
  if (password != verify_password) {
    req.flash('signup', 'Your passwords do not match.');
    res.redirect("back");
    return;
  };
  // Check if username is taken
  client.hexists("Users", username, function(err, exists) {
    if (exists) {
      req.flash('signup', 'Username is already taken.');
      res.redirect("back");
      return;
    };
    // Username doesn't exist, so create it and login
    var password_hash = crypto.createHash('md5').update(password).digest();
    var newUser = {
      username : username,
      firstname : firstname,
      lastname : lastname,
      password_hash : password_hash
    };
    var newUserStr = JSON.stringify(newUser);
    client.hset("Users", username, newUserStr);
    // store the username as a session variable
    req.session.username = username;
    // redirect the user to todos
    res.redirect('/todo');
  });  
};

exports.logout = function(req, res){
  req.session.username = null;
  req.flash('login', 'Successfully logged out.');
  res.redirect('/');
};

exports.deleteUser = function(req, res){
  // Delete Todos first
  client.del("Todo:"+req.session.username);
  // Delete user
  client.hdel("Users", req.session.username);
  // Redirec
  req.session.username = null;
  req.flash('login', 'Successfully deleted user and all Todos.');
  res.redirect('/');
};