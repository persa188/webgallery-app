/*jshint esversion:6*/
var crypto = require('crypto');
var path = require('path');
var express = require('express');
var app = express();
var sanitizer = require('sanitizer');
var validator = require('express-validator');

//body parser stuff
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
// app.use(bodyParser.json());
app.use(bodyParser.json({limit: '50mb'}));

//validator
app.use(validator([]));

//multer & upload dir stuff
var multer  = require('multer');
var upload = multer({ dest: 'uploads/' });

//nedb stuff
var Datastore = require('nedb'),
  comments = new Datastore({ filename: 'db/comments.db',
   autoload: true,
   timestampData : true}),
  pictures = new Datastore({ filename: 'db/pictures.db', autoload: true,
   timestampData : true}),
  users = new Datastore({filename: 'db/users.db',
   autoload: true}),
  galleries = new Datastore({filename: 'db/galleries.db',
   autoload: true});

//static paths
app.use(express.static('frontend'));
app.use(express.static('uploads'));
// app.use(express.static('test'));

// Comment constructor
var Comment = function(comment){
        this.content = comment.content;
        this.username = comment.username;
        this.picture = comment.picture;
};

// User constructor
var User = function(user){
    var salt = crypto.randomBytes(16).toString('base64');
    var hash = crypto.createHmac('sha512', salt);
    hash.update(user.password);
    this.username = user.username;
    this.picture = null;
    this.salt = salt;
    this.saltedHash = hash.digest('base64');
};

// Authentication

var checkPassword = function(user, password){
        var hash = crypto.createHmac('sha512', user.salt);
        hash.update(password);
        var value = hash.digest('base64');
        return (user.saltedHash === value);
};

var session = require('express-session');
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: {
      path: '/',
      secure: true,
      httpOnly: true,
      maxAge: null,
      sameSite: true
    }
}));

app.use(function (req, res, next){
    //for debugging only
    // console.log("HTTP request", req.method, req.url, req.body);
    return next();
});

// signout, signin
app.get('/api/signout/', function (req, res, next) {
    req.session.destroy(function(err) {
        if (err) return res.status(500).end(err);
        return res.redirect("/login.html");
    });
});

/*upload form handling using multipart form data as per reqs*/
app.post("/api/upload/", upload.single('picture'), function (req, res, next) {
  //auth
  if (!req.session.user) return res.status(403).end("Forbidden");
  req.body.username = req.session.user.username;

  //validate
  req.checkBody('title', 'empty param').notEmpty();
  req.checkBody('author', 'empty param').notEmpty();
  req.checkBody('username', 'empty param').notEmpty();
  req.checkBody('upload', 'empty param').notEmpty();

  var up = {};
  //set the form params & sanitize
  up.title = sanitizer.sanitize(req.body.title);
  up.author = sanitizer.sanitize(req.body.author);
  up.type = sanitizer.sanitize(req.body.upload);
  up.gallery = sanitizer.sanitize(req.body.username);

  //need this info for when we delete, i.e. if file we gotta remove from disk
  if (req.body.upload === "url") {
    up.source = req.body.url;
  } else {
    up.source = req.file.filename;
  }

  //insert
  pictures.insert(up, function(err, newDoc) {
    if (err) res.send(err);
    res.send({"status":200, "id":newDoc._id});
  });
});

//create user
app.put('/api/users/', function (req, res, next) {
    //validate and sanitize
    req.checkBody('username', 'empty param').notEmpty();
    req.checkBody('password', 'empty param').notEmpty();
    req.body.username = sanitizer.sanitize(req.body.username);
    req.body.password = sanitizer.sanitize(req.body.password);

    var data = new User(req.body);
    users.findOne({username: req.body.username}, function(err, user){
        if (err) return res.status(500).end(err);
        if (user) return res.status(409).end("Username " + req.body.username + " already exists");
        users.insert(data, function (err, user) {
            if (err) return res.status(500).end(err);
            return res.status(200).json(user.username);
        });
    });
});

//sign in
app.post('/api/signin/', function (req, res, next) {
    if (!req.body.username || ! req.body.password) return res.status(400).send("Bad Request");
    //sanitize
    req.body.username = sanitizer.sanitize(req.body.username);
    req.body.password = sanitizer.sanitize(req.body.password);

    users.findOne({username: req.body.username}, function(err, user){
        if (err) return res.status(500).end(err);
        if (!user || !checkPassword(user, req.body.password)) return res.status(401).end("Unauthorized");
        req.session.user = user;
        res.cookie('username', user.username, {httpOnly:true, secure: true, sameSite:true});
        return res.json({"status":200, "username": user.username});
    });
});

//intial redirect
app.get('/', function (req, res) {
  if (!req.session.user) res.redirect("login.html");
  else {
    res.redirect("gallery.html");
  }
});

app.post('/api/gallery/', function(req, res, next) {
  if (!req.session.user) return res.status(403).end("Unauthorized");
  // req.body.username = req.session.user.username;
  var gallery = {};
  gallery.owner = saniter.sanitize(req.body.username);
  gallery.name = sanitizer.sanitize(req.body.galleryname);
  //insert
  galleries.insert(gallery, function(err, newDoc) {
    if (err) return res.redirect("login.html");
    res.send({"status":200, "id":newDoc._id});
  });
});

//@DONE GET /api/image/:gallery/:id #get image from gallery or first from gallery
//getImage
app.get("/api/image/:gallery/:id", function(req, res) {
  if (!req.session.user) return res.status(403).end("Forbidden");
  //retrieve image
  //sanitize inputs & validate
  req.params.id = sanitizer.sanitize(req.params.id);
  req.params.gallery = sanitizer.sanitize(req.params.gallery);
  req.checkParams('id', 'empty').notEmpty();
  req.checkParams('gallery', 'empty').notEmpty();

  var id = req.params.id;
  var gid = req.params.gallery;

  if (id === "first") {
    pictures.findOne({gallery: gid}).sort({createdAt:1}).exec(function(err, data){
      res.send({"status":200, "raw":data});
    });
  } else {
    pictures.findOne({ _id: id, gallery: gid}, function(err, docs) {
      if (err) res.send(err);
      res.send({"status":200, "raw":docs});
    });
  }
});

//@DONE GET /api/image/:gallery/:next
//given timestamp get next image @TODO: test
app.get("/api/next/:gallery/:id", function(req, res) {
  if (!req.session.user) return res.status(403).end("Forbidden");
  var next = sanitizer.sanitize(req.params.id);
  var gid = sanitizer.sanitize(req.params.gallery);
  pictures.find({gallery: gid}).sort({createdAt:1}).exec(function (err, docs) {
    for (var i=0; i < docs.length; i++) {
      if (docs[i]._id === req.params.id) {
        next = docs[Math.min(i+1, docs.length - 1)];
      }
    }
    res.send({"status":200, "raw":next});
  });
});
//@DONE GET /api/image/:gallery/:prev
app.get("/api/prev/:gallery/:id", function(req, res) {
  if (!req.session.user) return res.status(403).end("Forbidden");
  //sanitize and validate
  req.params.gallery = sanitizer.sanitize(req.params.gallery);
  req.params.id= sanitizer.sanitize(req.params.id);
  req.checkParams('gallery', 'empty param').notEmpty();
  req.checkParams('id', 'empty param').notEmpty();

  //function body
  var gid = req.params.gallery;
  pictures.find({gallery: gid}).sort({createdAt:1}).exec(function(err, data) {
    var prev = req.params.id;
    for (var i = 0; i < data.length; i ++){
      if (data[i]._id == req.params.id){
        prev = data[Math.max((i-1), 0)];
      }
    }
    res.send({"status":200,"raw":prev});
  });
});

//@DONE DELETE /api/image/:gallery/:id
app.delete("/api/image/:gallery/:image", function(req, res){
  if (!req.session.user) return res.status(403).end("Forbidden");

  //sanitize and validate
  req.params.gallery = sanitizer.sanitize(req.params.gallery);
  req.params.image= sanitizer.sanitize(req.params.image);
  req.checkParams('gallery', 'empty param').notEmpty();
  req.checkParams('image', 'empty param').notEmpty();

  if (req.params.gallery !== req.session.user) return res.status(403).end("Forbidden");
  //remove image
  pictures.findOne({_id: req.params.image}, {}, function(err, data){
      if (data.type === "file") {
        //remove from disk first
        //this method is from
        //https://nodejs.org/api/fs.html#fs_file_system
        fs.unlink('./uploads/'+data.source, (err) => {
          if (err) console.log(err);
        });
      }
  });

  pictures.remove({_id: req.params.image}, {}, function(err, numRemoved){
    if (err) console.log(err);

    //remove comments
    comments.remove({imgid: req.params.image}, {multi:true}, function (err, numr) {
      res.send({"status": 200});
    });
  });
});

//@DONE GET /api/galleries/:start_index #get a list of galleries paginated
app.get("/api/galleries/:start_index", function(req, res) {
  /*
  load the comments based on imgid and sort by timestamp (most recent),
  then just grab the relevant ones based on start_index
  */
  if (!req.session.user) return res.status(403).end("Forbidden");
  //remove image
  //sanitize + validate
  req.checkParams('start_index', 'invalid').notEmpty();
  req.params.start_index = sanitizer.sanitize(req.params.start_index);

  var start_index = req.params.start_index;
  users.find({}).sort({createdAt:-1}).exec(function(err, data) {
    if (data.length === 0 || data.length <= start_index){
      res.send({"status":200, "galleries":"nogalleries"});
    } else {
      var result = [];
      for (var i = start_index; i < Math.min(start_index + 10, data.length); i++) {
        if (data[i]){
          result.push({"username": data[i].username,
           "name": data[i].username+"'s Gallery"});
        }
      }

      res.send({"status":200, "galleries": result});
    }
  });
});

//@DONE ADD Comment
//addcomment
app.post("/api/addcomment/", function(req, res){
  if (!req.session.user) return res.status(403).end("Forbidden");
  /*
  * adds a comment using imgid as an identifier, html is the actual comment html
  * as created by clientside, since it was done clientside in A1 leave it there,
  * otherwise would have done on the server tbh
  */
  req.checkBody('imgid', 'empty').notEmpty();
  req.checkBody('name', 'empty').notEmpty();
  req.checkBody('content', 'empty').notEmpty();
  req.checkBody('timestamp', 'empty').notEmpty();
  var comment = {
    imgid: sanitizer.sanitize(req.body.imgid),
    name: sanitizer.sanitize(req.body.name),
    content: sanitizer.sanitize(req.body.content),
    username: sanitizer.sanitize(req.session.user.username),
    timestamp: sanitizer.sanitize(req.body.timestamp)
  };

  comments.insert(comment, function(err, newDoc) {
    if (err) res.send(err);
    res.send({"status":200, "id":newDoc._id});
  });

});

//@DONE GET comments
app.get("/api/comments/:imgid/:start_index", function(req, res) {
  if (!req.session.user) return res.status(403).end("Forbidden");
  /*
  load the comments based on imgid and sort by timestamp (most recent),
  then just grab the relevant ones based on start_index
  */
  req.checkParams('imgid', 'empty').notEmpty();
  req.checkParams('start_index', 'empty').notEmpty();
  req.params.start_index = sanitizer.sanitize(req.params.start_index);
  req.params.imgid = sanitizer.sanitize(req.params.imgid);

  var start_index = req.params.start_index;
  comments.find({imgid: req.params.imgid}).sort({createdAt:-1}).exec(function(err, data) {
    if (data.length === 0 || data.length <= start_index){
      res.send({"status":200, "comments":"nocomments"});
    } else {
      var result = [];
      for (var i = start_index; i < Math.min(start_index + 10, data.length); i++) {
        result.push(data[i]);
      }
      res.send({"status":200, "comments": result});
    }
  });
});

//@DONE DELETE Comment
//delete a comment given imgid and html
app.delete("/api/comment/:id/:owner", function(req, res){
  if (!req.session.user) return res.status(403).end("Forbidden");
  //remove image
  //validation
  req.checkParams('id', "empty param").notEmpty();
  req.checkParams('owner', "empty param").notEmpty();
  //sanitization
  req.params.id = sanitizer.sanitize(req.params.id);
  req.params.owner = sanitizer.sanitize(req.params.owner);

  comments.findOne({_id: req.params.id}, {}, function(errm, docs) {
    if ((docs.username === req.session.user.username) || req.body.owner === "true"){

      comments.remove({_id: req.params.id}, {}, function (err, numRemoved) {
        if (err) console.log(err);
        res.send({"numremoved": numRemoved});
      });
    } else {

      res.json(403);
    }
  });
});

//https setup
var https = require("https");
var fs = require('fs');
var privateKey = fs.readFileSync( 'certs/server.key' );
var certificate = fs.readFileSync( 'certs/server.crt' );
var config = {
        key: privateKey,
        cert: certificate
};

//https server
https.createServer(config, app).listen(3000, function () {
    console.log('HTTPS on port 3000');
});
