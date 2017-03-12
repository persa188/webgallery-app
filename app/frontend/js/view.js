/*jshint esversion:6*/
var view = (function(){
  "use strict";
  //following lab2/3 style
  var view = {};

  //a function to minimize/maximize a div/element
  view.toggle_minimized = function toggle_minimized(e){
    var u = localStorage.getItem("gallery");
    var v = localStorage.getItem("curruser");
    if (e === "upload-form" && u !== v){
      alert("this image will be placed in your gallery and you will not be redirected");
    }
    var x = document.getElementById(e);
    /*all code in function below was taken from
    http://www.w3schools.com/howto/tryit.asp?filename=tryhow_js_toggle_hide_show
    */
    if (x.style.display === 'none') {
      x.style.display = 'flex';
    } else {
      x.style.display = 'none';
    }
    return false; //to prevent refresh
  };

  //load initial gui stuff
  window.onload = function() {
      //todo
      //1. ask model via. controller to make the slide element
      var urlid = parseURLHash();
      var gid = localStorage.getItem("gallery");
      //normal case
      doAjax('GET', '/api/image/'+gid+"/"+urlid, null,
      true, function(err, data){
            if (err) console.error(err);
            //check for a 404
            if (!data.raw && urlid !== "first") {
              window.location = "./404.html";
            } else if (data) {      //load the image (as per assignment specs)
                  document.dispatchEvent(new CustomEvent ('loadImg-1', {"detail":
                    (data.raw._id)
                  }));
            }
        });
  };

  //radio button handler #1
  document.getElementById("file_radio").onclick = function(){
    //this doesnt require processing so i'll just insert hardcoded html
    //instead of involving model & controller
    var e = `
    <input id="file" type="file" name="picture" accept="image/*" class="form_element" required>
    <input id="fileurl" type="hidden">
    `;
    document.getElementById("radioinput").innerHTML = e;
  };

  //radio button handler #2
  document.getElementById("url_radio").onclick = function(){
    //this doesnt require processing so i'll just insert hardcoded html
    //instead of involving model & controller
    var e = `
    <input id="url" type="text" name="url" accept="image/*" placeholder="url" class="form_element" required>
    `;
    document.getElementById("radioinput").innerHTML = e;
  };

  //upload form processor
  //skip the model.js part for now since structure doesn't matter (as much) for a2
  //https://stackoverflow.com/questions/35511744/multipart-form-data-possible-to-send-with-javascript
  document.getElementById("upload-form").onsubmit = function(e){
    e.preventDefault();

    var form = document.getElementById('upload-form'); // give the form an ID
    var xhr  = new XMLHttpRequest();              // create XMLHttpRequest
    var data = new FormData(form);                // create formData object

    e.target.reset();
    xhr.onload = function() {
        var response = JSON.parse(this.responseText);
        document.dispatchEvent(new CustomEvent ('loadImg-1', {"detail":
          (response.id)
        }));
    };

    xhr.open("post", form.action);      // open connection
    xhr.send(data);
  };

  //listens for events related to dynamically created elements
  //need to use query selector, credits for this approach in credts.html
  document.querySelector('body').addEventListener('click', function(event) {
    var gid = localStorage.getItem("gallery");
    if (event.target.id.toLowerCase() === 'nextimg') { //next img
      doAjax('GET', '/api/next/'+gid+"/"+parseURLHash(), null,
      true, function(err, data){
            if (err) console.error(err);
            else {      //load the image (as per assignment specs)
                  document.dispatchEvent(new CustomEvent ('loadImg-1', {"detail":
                    (data.raw._id)
                  }));
                }
        });
    }else if (event.target.id.toLowerCase() === 'previmg') { //prev img
      // var gid = localStorage.getItem("gallery");
      doAjax('GET', '/api/prev/'+gid+"/"+parseURLHash(), null,
      true, function(err, data){
            if (err) console.error(err);
            else {      //load the image (as per assignment specs)
                  document.dispatchEvent(new CustomEvent ('loadImg-1', {"detail":
                    (data.raw._id)
                  }));
                }
        });
    } else if (event.target.id.toLowerCase() === 'deleteimg') { //delete img
      //ask for confirmation and delete
      var opt = confirm("Are you sure you want to delete this image?");
      if (opt === true) {
        document.dispatchEvent(new CustomEvent ('deleteimage',
          {"detail":parseURLHash()
        }));
      }
    }
  });

  //since comment form is dynamically created we need another query selector
  //for the form submit
  document.querySelector('body').addEventListener('submit', function(event) {
    if (event.target.id === "create_comment_form") {
      event.preventDefault();
      //raise the event and send data
      document.dispatchEvent(new CustomEvent ('newComment', {"detail":
        {
          "name": document.getElementById("create_comment_name").value,
          "content": document.getElementById("create_comment_content").value,
          "img": localStorage.getItem("currimage").replace(/['"]+/g, '')
        }
      }));
    }
  });

  view.loadimg = function(e) {
    //image
    document.getElementById("img-container").innerHTML = e.html;

    //change the url fragment as per handout, see credits urlfragment section
    //for the source of this strategy
    var id = encodeURI(e.id);
    var u = localStorage.getItem("curruser");
    window.location.hash = "#home?id="+id;
    //comments form taken from cscc09w17 lab 3 made by thierry
    document.getElementById("comment-form").innerHTML = `
    <form class="complex_form" id="create_comment_form">
      <div class="form_title">
        <div class="togglebtn">
          <button onclick="return view.toggle_minimized('minimizable2');">-</button>
        </div>
        <h2>Post a comment</h2>
      </div>
      <div id="minimizable2" class="complex_mini" style="display:flex;">
        <input type="text" id="create_comment_name" class="form_element" placeholder="Enter your name" value="${u}" required/>
        <textarea id="create_comment_content" class="form_element" placeholder="Enter your comment"  rows="5" required></textarea>
        <input type="submit" class="btn"/>
      </div>
    </form>
    `;
    //load comments, if any
    view.loadComments();
  };

  /*this function processes file uploads as data urls, taken from:
https://developer.mozilla.org/en-US/docs/Web/API/FileReader/readAsDataURL
*/
  view.process = function() {
    var preview = document.getElementById("fileurl");
    var file    = document.querySelector('input[type=file]').files[0];
    var reader  = new FileReader();
    reader.addEventListener("load", function () {
      preview.value = reader.result;
    }, false);

    if (file) {
      reader.readAsDataURL(file);
    }
    return false;
  };

  //check the url hash
  //a return value of null means no id was specified
  //otherwise return imgid if valid or 404 if imgid not valid
  function parseURLHash(){
    //@TODO seems to be a bug with img3 and page refresh
    var hash = window.location.hash;
    var parts = hash.split("=");
    var res = null;

    if (parts[1]) {
      return parts[1];
    }
    return "first";
  }

  //loads comments for curr image, exposed so that controller can access it
  view.loadComments = function(start_index=0) { //always load for current image only
    var currimage = localStorage.getItem("currimage").replace(/['"]+/g, '');
    // var comments = JSON.parse(localStorage.getItem("comments_"+currimage));
    var container = document.getElementById("comments-container");
    container.innerHTML = "";//reset

    doAjax('GET', '/api/comments/'+currimage+"/"+start_index, null,
      true, function(err, data){
            if (err) console.error(err);
            else {
                if (data.comments !== "nocomments"){
                  for (var i = 0; i < Math.min(data.comments.length); i++) {
                    var div = document.createElement('div');
                    div.className = "comment";
                    div.innerHTML = `
                                <div class="comment_header">
                                  <div class="comment_avatar">
                                    <img src="media/user.png" alt="${data.comments.name}">
                                  </div>
                                  <div class="comment_name">
                                    <p>${data.comments[i].name}</p>
                                  </div>
                                </div>
                                <div class="comment_content">
                                  <div class="post-content">${data.comments[i].content}</div>
                                </div>
                                <div class="comment_date">
                                  <p>posted on: ${data.comments[i].timestamp}</p>
                                </div>
                                <div class="comment_delete">
                                  <input type="image" src="media/delete.png" width="30px" height="30px" onclick="view.deletecomment(this,'${data.comments[i]._id}');">
                                </div>
                            `;
                    container.appendChild(div);
                }
              }
              //add the buttons
              var btns = document.createElement('div');
              btns.className = "comment_btns";
              btns.innerHTML = `
              <input type="image" src="media/prev.png" onClick="view.decrComment(${start_index})">
              ${Math.abs(start_index /10) + 1}
              <input type="image" src="media/next.png" onClick="view.incrComment(${start_index})">
              `;
              container.appendChild(btns);
            }
        });
  };

  view.incrComment = function(e){
    //validation taken care of via backend
    view.loadComments(e + 10);
  };

  view.decrComment = function(e){
    //validation taken care of via backend
    view.loadComments(Math.max(e - 10, 0));
  };

  view.deletecomment = function(t,e) {
    var g = localStorage.getItem("gallery");
    var u = localStorage.getItem("curruser");
    var owner = true;
    if (g!==u) {
      owner = false;
    }
      document.dispatchEvent(new CustomEvent ('deletecomment', {"detail":
        {
          "event": t,
          "id": e
        }
      }));
  };

  view.refresh = function (){
    window.location = "../gallery.html";
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
