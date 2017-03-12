/*jshint esversion:6*/
var view = (function(){
  "use strict";
  //following lab2/3 style
  var view = {};

  //a function to minimize/maximize a div/element
  view.toggle_minimized = function toggle_minimized(e){
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
      var urlimg = parseURLHash();

      if (urlimg){
        document.dispatchEvent(new CustomEvent ('loadImg-1', {"detail":
          urlimg
        })); //we only want the first one loaded
      } else if (localStorage.getItem("imgs")){
        var ids = JSON.parse(localStorage.getItem("imgs"));
        document.dispatchEvent(new CustomEvent ('loadImg-1', {"detail":
          ids[0]
        })); //we only want the first one loaded
      }

      //2. ask model via. controller to make the comments
      //3. insert to html page
  };

  //radio button handler #1
  document.getElementById("file_radio").onclick = function(){
    //this doesnt require processing so i'll just insert hardcoded html
    //instead of involving model & controller
    var e = `
    <input id="file" type="file" name="pic" accept="image/*" class="form_element" onchange="view.process()">
    <input id="fileurl" type="hidden">
    `;
    document.getElementById("radioinput").innerHTML = e;
  };

  //radio button handler #2
  document.getElementById("url_radio").onclick = function(){
    //this doesnt require processing so i'll just insert hardcoded html
    //instead of involving model & controller
    var e = `
    <input id="url" type="text" name="pic" accept="image/*" placeholder="url" class="form_element">
    `;
    document.getElementById("radioinput").innerHTML = e;
  };

  //upload form processor
  document.getElementById("upload-form").onsubmit = function(e){
    e.preventDefault();

    //data
    var file = null;
    var url = null;
    var author = null;
    var title = null;

    //sanitize the upload input & throw appropriate errors
    if (document.getElementById("file")){
      //@TODO FIX FILE UPLOAD, get that data url...
      file = document.getElementById("fileurl").value;
      // console.log(file);
    } else if (document.getElementById("url")){
      url=document.getElementById("url").value;
    } else {
      window.alert("no url or file specified");
      return false;
    }

    //sanitize author & title input
    if (document.getElementById("form_authorname")) {
      author = document.getElementById("form_authorname").value;
    } else {
      author = "Uknown Author";
    }

    if (document.getElementById("form_itemtitle")) {
      title = document.getElementById("form_itemtitle").value;
    } else {
      title = "Uknown Title";
    }

    //clean form
    document.getElementById("upload-form").reset();

    //raise the event and send data
    document.dispatchEvent(new CustomEvent ('onFormSubmit', {"detail":
      {"author": author, "title": title, "url": url, "file": file}
    }));
  };

  //listens for events related to dynamically created elements
  //need to use query selector, credits for this approach in credts.html
  document.querySelector('body').addEventListener('click', function(event) {
    if (event.target.id.toLowerCase() === 'nextimg') { //next img
      var next_img = nextImage(1);
      document.dispatchEvent(new CustomEvent ('loadImg-1', {"detail":
        next_img
      }));
    }else if (event.target.id.toLowerCase() === 'previmg') { //prev img
      var prev_img = nextImage(-1);
      document.dispatchEvent(new CustomEvent ('loadImg-1', {"detail":
        prev_img
      }));
    } else if (event.target.id.toLowerCase() === 'deleteimg') { //delete img
      //ask for confirmation and delete
      var opt = confirm("Are you sure you want to delete this image?");
      if (opt === true) {
        deleteImage();
      }
    }
  });

  //since comment form is dynamically created we need another query selector
  //for the form submit
  document.querySelector('body').addEventListener('submit', function(event) {
    if (event.target.id === "create_comment_form") {
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
      <div id="minimizable2" class="complex_mini" style="display:none;">
        <input type="text" id="create_comment_name" class="form_element" placeholder="Enter your name"/>
        <textarea id="create_comment_content" class="form_element" placeholder="Enter your comment"  rows="5"></textarea>
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

  /*next image function for next/prev buttons
  dir = +1 if next and -1 if prev
  */
  function nextImage(dir) {
    //setup
    var curr = JSON.parse(localStorage.getItem("currimage"));
    var imgs = JSON.parse(localStorage.getItem("imgs"));
    var len = imgs.length;
    var nextimg = null;
    //find next img
    for (var i=0; i < len; i++) {
      if (imgs[i] === curr) {
        //if statement needed cuz math is hard..
        if (i === 0 && dir < 0) {
          nextimg = imgs[len - 1];
        } else {
          nextimg = imgs[Math.abs(i + dir) % (len)];
        }
      }
    }
    return nextimg;
  }

  function deleteImage() {
    //setup
    var curr = JSON.parse(localStorage.getItem("currimage"));
    var imgs = JSON.parse(localStorage.getItem("imgs"));
    //remove the element
    var index = imgs.indexOf(curr);
    if (index > -1) {
      imgs.splice(index, 1);
    }
    //remove the element & refresh page
    localStorage.setItem("imgs", JSON.stringify(imgs));
    localStorage.removeItem(curr);
    window.location="/index.html";
  }

  //check the url hash
  //a return value of null means no id was specified
  //otherwise return imgid if valid or 404 if imgid not valid
  function parseURLHash(){
    //@TODO seems to be a bug with img3 and page refresh
    var hash = window.location.hash;
    var parts = hash.split("=");
    var imgs = JSON.parse(localStorage.getItem("imgs"));
    var res = null;
    if (parts[1]) { //this is where imgid will be
      if (imgs.indexOf(parts[1]) >= 0) {//if exists
        res = parts[1];
      } else {//throw 404
        window.location="/404.html";
      }
    }

    return res;
  }

  //loads comments for curr image, exposed so that controller can access it
  //@TODO: make it so only most recent 10 are displayed
  view.loadComments = function(start_index=0) { //always load for current image only
    var currimage = localStorage.getItem("currimage").replace(/['"]+/g, '');
    var comments = JSON.parse(localStorage.getItem("comments_"+currimage));
    var container = document.getElementById("comments-container");

    //reset the container first
    container.innerHTML = "";

    if (comments === null){
      //its blank because i'd rather not use a try & catch here
      //and its cleaner than rewriting the if statement to somthing
      //nastier
      // console.log("no comments found for this image");
    }else if (comments.length - start_index > 0){ //just incase
      //run through the list of comments
      console.log(start_index);
      comments.reverse();
      //idea to use appendchild came from a post on stack overflow
      //see @nodes tag in credits.html
      var end_index = Math.min(start_index + 10, comments.length);
      for (var i = start_index; i < end_index; i++) {
        var div = document.createElement('div');
        div.className = "comment";
        div.innerHTML = comments[i];
        container.appendChild(div);
      }

      //@TODO add the prev and next buttons
      var btns = document.createElement('div');
      btns.className = "comment_btns";
      btns.innerHTML = `
      <input type="image" src="media/prev.png" onClick="view.decrComment(${start_index})">
      ${Math.abs(start_index /10) + 1}
      <input type="image" src="media/next.png" onClick="view.incrComment(${start_index})">
      `;
      container.appendChild(btns);
    }
  };

  view.incrComment = function(e){
    //validation not taken care of by load function
    var currimage = localStorage.getItem("currimage").replace(/['"]+/g, '');
    var comments = JSON.parse(localStorage.getItem("comments_"+currimage));

    if (e + 10 > comments.length) {
      console.log("no more comments");
    }else{
      view.loadComments(e + 10);
    }
  };

  view.decrComment = function(e){
    if (e > 0){
      if (e-10 > 0){
        view.loadComments(e - 10);
      }else {
        view.loadComments(0);
      }
    } else {
      console.log("no more comments");
    }
  };

  view.deletecomment = function(e) {
    var innerHTML = JSON.stringify(e.parentElement.parentElement.innerHTML);
    document.dispatchEvent(new CustomEvent ('deletecomment', {"detail":
      innerHTML
    }));
  };
  return view;
}());
