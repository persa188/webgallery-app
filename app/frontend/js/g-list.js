//this is essentially the view for glist, model and controller are shared
/*jshint esversion:6*/
var view = (function(){
  "use strict";
  var view = {};

  //load initial gui stuff
  window.onload = function() {
    localStorage.setItem("gindex", 0);
    loadGalleries(0);
  };

  var loadGalleries = function (index) {
    doAjax("GET", "/api/galleries/"+index, null, true, function(err, data){
      if (data.galleries !== "nogalleries"){
        var container = document.getElementById("list");
        //empty div first, then fill with the data
        container.innerHTML="";

        for (var i = 0; i < Math.max(data.galleries.length, 0); i++) {
          var div = document.createElement('div');
          div.className = "gallery";
          div.innerHTML = `
          <div onclick="view.changeGallery('${data.galleries[i].username}');" class="gitem">
            ${data.galleries[i].name}
          </div>
          `;
          container.appendChild(div);
        }
        localStorage.setItem("gindex", index);
        createButtons();
      }
    });
  };

  var createButtons = function(){
    var gindex = localStorage.getItem("gindex");
    var container = document.getElementById('list');
    var buttons = document.createElement('div');
    buttons.className = "listbuttons";
    buttons.innerHTML = `
      <input id="prevgalleries" type="image" class="imgbtn" src="media/prev.png"/>
      ${Math.abs(gindex /10) + 1}
      <input id="nextgalleries" type="image" class="imgbtn" src="media/next.png"/>
      </div>`;
    container.appendChild(buttons);
  };

  view.changeGallery = function (name) {
    localStorage.setItem("gallery", name);
    window.location="gallery.html";
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

  document.querySelector('body').addEventListener('click', function(event) {
    var gindex = localStorage.getItem("gindex");
    if (event.target.id.toLowerCase() === 'nextgalleries') {
      loadGalleries(gindex + 10);
    }else if (event.target.id.toLowerCase() === 'prevgalleries') {
      loadGalleries(Math.max(gindex - 10, 0));
    }
  });

  return view;
}());
