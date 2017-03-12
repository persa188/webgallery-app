/*jshint esversion:6*/
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var multer  = require('multer');
var upload = multer({dest: './uploads/'});
var fs = require('fs');

app.use(bodyParser.json({limit: '50mb'}));

//nedb stuff
var Datastore = require('nedb'),
  comments = new Datastore({ filename: 'db/comments.db',
   autoload: true,
   timestampData : true}),
  pictures = new Datastore({ filename: 'db/pictures.db', autoload: true,
   timestampData : true});

//middleware
app.use(express.static('frontend'));
app.use(express.static('uploads'));

//intial redirect
app.get('/', function (req, res) {
  res.redirect("frontend/login.html");
});

//getImage
app.get("/api/image/:id", function(req, res) {
  //retrieve image
  var id = req.params.id;

  if (id === "first") {
    pictures.findOne({}).sort({createdAt:1}).exec(function(err, data){
      res.send({"status":200, "raw":data});
    });
  } else {
    pictures.findOne({ _id: id}, function(err, docs) {
      if (err) res.send(err);
      res.send({"status":200, "raw":docs});
    });
  }
});

//given timestamp get next image @TODO: test
app.get("/api/next/:id", function(req, res) {
  var next = req.params.id;
  pictures.find({}).sort({createdAt:1}).exec(function (err, docs) {
    for (var i=0; i < docs.length; i++) {
      if (docs[i]._id === req.params.id) {
        next = docs[Math.min(i+1, docs.length - 1)];
      }
    }
    res.send({"status":200, "raw":next});
  });
});

//get preev image @TODO: test
app.get("/api/prev/:id", function(req, res) {
  pictures.find({}).sort({createdAt:1}).exec(function(err, data) {
    var prev = req.params.id;
    for (var i = 0; i < data.length; i ++){
      if (data[i]._id == req.params.id){
        prev = data[Math.max((i-1), 0)];
      }
    }
    res.send({"status":200,"raw":prev});
  });
});

//addcomment
app.post("/api/addcomment/", function(req, res){
  /*
  * adds a comment using imgid as an identifier, html is the actual comment html
  * as created by clientside, since it was done clientside in A1 leave it there,
  * otherwise would have done on the server tbh
  */
  var comment = {
    imgid: req.body.imgid,
    html: req.body.html
  };

  comments.insert(comment, function(err, newDoc) {
    if (err) res.send(err);
    res.send({"status":200, "id":newDoc._id});
  });

});

app.get("/api/comments/:imgid/:start_index", function(req, res) {
  /*
  load the comments based on imgid and sort by timestamp (most recent),
  then just grab the relevant ones based on start_index
  */
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

//delete a comment given imgid and html
app.delete("/api/comment/", function(req, res){
  comments.remove({$and: [{imgid: req.body.imgid }, {html: JSON.parse(req.body.html)}]}, {}, function (err, numRemoved) {
    if (err) console.log(err);
    res.send({"numremoved": numRemoved});
  });
});

app.delete("/api/image/", function(req, res){
  //remove image
  pictures.findOne({_id: req.body.imgid}, {}, function(err, data){
      if (data.type === "file") {
        //remove from disk first
        //this method is from
        //https://nodejs.org/api/fs.html#fs_file_system
        fs.unlink('./uploads/'+data.source, (err) => {
          if (err) throw err;
          console.log("removed from disk", data.source);
        });
      }
  });

  pictures.remove({_id: req.body.imgid}, {}, function(err, numRemoved){
    if (err) console.log(err);

    //remove comments
    comments.remove({imgid: req.body.imgid}, {multi:true}, function (err, numr) {
      res.send({"status": 200});
    });
  });
});

/*upload form handling using multipart form data as per reqs*/
app.post("/api/upload/", upload.single('picture'), function (req, res, next) {
  var up = {};
  //set the form params
  up.title = req.body.title;
  up.author = req.body.author;
  up.type = req.body.upload;

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


//run
app.listen(3000, function () {
  console.log('App listening on port 3000');
});
