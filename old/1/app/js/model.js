/*jshint esversion:6*/
var model = (function(){
    "use strict";

    var model = {};

    //upload image
    model.upload = function(e){
      //curr + 1 will be the image index
      var index = 0;

      //check if curr is set else start at 0
      if (localStorage.getItem("currimageindex")) {
        index = parseInt(localStorage.getItem("currimageindex")) + 1;
      }

      var data = null;
      var type = "url";
      //if file
      if (e.file) {
        //set as b64 img
        data = e.file;
      } else {
        data = e.url; //gauranteed to exist in this case
      }
      //check if images already exist
      var imgs = [];
      if (localStorage.getItem("imgs")){
        imgs = JSON.parse(localStorage.getItem("imgs"));
      }
      imgs.push("img"+index);
      //save
      localStorage.setItem("imgs", JSON.stringify(imgs)); //for managing imgs & easy deletion
      localStorage.setItem("img"+index, JSON.stringify({"source": data, "type":type, "author":e.author, "title":e.title}));
      localStorage.setItem("currimageindex", index);

      //load the image (as per assignment specs)
      document.dispatchEvent(new CustomEvent ('loadImg-1', {"detail":
        ("img"+index)
      }));
    };

    model.createImage = function(e) {
      //image will exist unless someone does hacky stuff - not my concern
      var raw = JSON.parse(localStorage.getItem(e));
      var data = null;

      data = `
      <img src="${raw.source}" onerror="this.onerror=null;this.src='./media/error-404.png';">
      <div class="caption">
      <h1>${raw.title} by ${raw.author}</h1>
      <input id="previmg" type="image" class="imgbtn" src="media/prev.png"/>
      <input id="deleteimg" type="image" class="imgbtn" src="media/delete.png"
        height="32px" width="32px"/>
      <input id="nextimg" type="image" class="imgbtn" src="media/next.png"/>
      </div>
      `;


      document.dispatchEvent(new CustomEvent ('loadImg-2', {"detail":
        data
      }));
    };

    model.createComment = function(e) {
      var img = e.img;
      var comments = [];

      //if comments already exist grab them
      if (localStorage.getItem("comments_"+img)) {
        comments = JSON.parse(localStorage.getItem("comments_"+img));
      }

      //the comment html
      var cmt = `
          <div class="comment_header">
            <div class="comment_avatar">
              <img src="media/user.png" alt="${e.name}">
            </div>
            <div class="comment_name">
              <p>${e.name}</p>
            </div>
          </div>
          <div class="comment_content">
            <div class="post-content">${e.content}</div>
          </div>
          <div class="comment_date">
            <p>posted on: ${new Date()}</p>
          </div>
          <div class="comment_delete">
            <input type="image" src="media/delete.png" width="30px" height="30px" onClick="view.deletecomment(this);">
          </div>
      `;

      //add to current comments & update localStorage
      comments.push(cmt);
      localStorage.setItem("comments_"+img, JSON.stringify(comments));

      //send to controller to let view know we're done
      document.dispatchEvent(new CustomEvent ('comment-ready', {"detail":
        "comments_"+img
      }));
    };

    model.deletecomment = function(e) {
      var currimage = localStorage.getItem("currimage").replace(/['"]+/g, '');
      var comments = JSON.parse(localStorage.getItem("comments_"+currimage));
      var index = 0;

      for (var i=0; i < comments.length; i++) {
        if (comments[i] === e) {
          index = i;
        }
      }
      //remove and update storage then page
      comments.splice(index, 1);
      localStorage.setItem("comments_"+currimage, JSON.stringify(comments));
      view.loadComments();
    };

    return model;
}());
