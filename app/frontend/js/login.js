/*jshint esversion:6*/
var view = (function(){

  window.onload = function(){
    make_loginform();
  };

  document.querySelector('body').addEventListener('submit', function(event) {
    if (event.target.id === "login-form") {
      event.preventDefault();
      var username = document.getElementById('username').value;
      var password = document.getElementById('password').value;
      var ld = {
        "username": username,
        "password": password
      };

      doAjax("POST", "/api/signin/", ld, true, function(err, data) {
        if (err) window.alert("bad credentials");
        else if (data.status === 200) {
          localStorage.setItem("gallery", data.username);
          localStorage.setItem("curruser", data.username);
          window.location="gallery.html";
        }
      });
    } else if (event.target.id === "register-form") {
      event.preventDefault();
      var new_username = document.getElementById('username').value;
      var new_password = document.getElementById('password').value;
      var fd = {
        "username": new_username,
        "password": new_password
      };
      doAjax("PUT", "/api/users/", fd, true, function (err, data) {
        if (err) window.alert("invalid username/password");
        else {
          make_loginform();
          window.alert("success, please login");
        }
      });
    }
  });

  document.querySelector('body').addEventListener('click', function(event) {
    if (event.target.id.toLowerCase() === 'register'){
      make_regform();
    } else if (event.target.id.toLowerCase() === 'loginform'){
      make_loginform();
    }
  });

  var make_regform = function() {
    document.title="register";
    var regform = `
        <form id="register-form" class="complex_form">
          <div class="form_title"> Register </div>
          <label for="username"> username </label>
          <input id="username" type="text" name="username" placeholder="Username" class="form_element" required>
          <label for="password"> password </label>
          <input id="password" type="password" name="password" placeholder="Password" class="form_element" required>
          <div id="register" class="reglink"> <a id="loginform">Already a member? Click me to Login!</a></div>
          <input type="submit" class="btn">
        </form>
        `;
    var formdiv = document.getElementById("main-form");
    formdiv.innerHTML = regform;
  };

  var make_loginform = function () {
    document.title="login";
    var login = `
    <form id="login-form" class="complex_form">
      <div class="form_title"> Login </div>
      <label for="username"> username </label>
      <input id="username" type="text" name="username" placeholder="Username" class="form_element" required>
      <label for="password"> password </label>
      <input id="password" type="password" name="password" placeholder="Password" class="form_element" required>
      <div id="register" class="reglink"> <a id="register">Not a member? Click me to Register!</a></div>
      <input type="submit" class="btn">
    </form>
    `;

    var formdiv = document.getElementById("main-form");
    formdiv.innerHTML = login;
  };

  /*from thiery's lab5 code*/
  var doAjax = function (method, url, body, json, callback){
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function(e){
        switch(this.readyState){
             case (XMLHttpRequest.DONE):
                if (this.status === 200) {
                    if (json) return callback(null, JSON.parse(this.responseText));
                    return callback(null, this.responseText);
                }else{
                    return callback(this.responseText, null);
                }
        }
    };
    xhttp.open(method, url, true);
    if (json) xhttp.setRequestHeader('Content-Type', 'application/json');
    xhttp.send((body)? JSON.stringify(body) : null);
  };

  return view;
}());
