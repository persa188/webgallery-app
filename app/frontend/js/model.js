/*jshint esversion:6*/
var model = (function(){
    "use strict";

    var model = {};

    model.createImage = function(e) {
      //image will exist unless someone does hacky stuff - not my concern
      var gid = localStorage.getItem("gallery");
      doAjax('GET', '/api/image/' + gid +"/"+e, null,
        true, function(err, data){
              if (err) console.error(err);
              else {      //load the image (as per assignment specs)

                var rawhtml = `
                <img src="${data.raw.source}" onerror="this.onerror=null;this.src='./media/error-404.png';">
                <div class="caption">
                <h1>${data.raw.title} by ${data.raw.author}</h1>
                <input id="previmg" type="image" class="imgbtn" src="media/prev.png"/>
                <input id="deleteimg" type="image" class="imgbtn" src="media/delete.png"
                  height="32px" width="32px"/>
                <input id="nextimg" type="image" class="imgbtn" src="media/next.png"/>
                </div>
                `;
                document.dispatchEvent(new CustomEvent ('loadImg-2', {"detail":
                  {"html": rawhtml, "id": data.raw._id}
                }));
              }
          });
    };

    model.createComment = function(e) {

      //image will exist unless someone does hacky stuff - not my concern
      doAjax('POST', '/api/addcomment/', {"imgid": e.img, "name": e.name, "content":e.content, "timestamp": new Date()},
        true, function(err, data){
              if (err) console.error(err);
              else {
                //send to controller to let view know we're done
                document.dispatchEvent(new CustomEvent ('comment-ready', {"detail":
                  "comments_"+e.img
                }));
              }
          });
    };

    model.deletecomment = function(e) {
      var uid = localStorage.getItem("curruser");
      var gid = localStorage.getItem("gallery");
      var owner = "true";
      if (gid !== uid) {
        owner = "false";
      }
      doAjax("DELETE", "/api/comment/"+e.id+"/"+owner, null, true,
       function(err, data){
        //do nothing
        if (err) console.log(err);
        else if (data !== 403){
          e.event.parentElement.parentElement.remove(); //rm from front-end
        }
      });
    };

    model.deleteimage = function(e) {
      //make the deleteRequest
      //@TODO
      var gid = localStorage.getItem("gallery");
      doAjax('DELETE', '/api/image/'+gid+"/"+e, null,
      true, function(err, data){
            if (err) console.log(err);
            else {
                  document.dispatchEvent(new CustomEvent ('imagedeleted'));
                }
        });
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


    return model;
}());
