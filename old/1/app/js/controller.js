/*jshint esversion:6*/
(function(model, view){
    "use strict";

    document.addEventListener('onFormSubmit', function(e) {
      var data = e.detail;
      model.upload(data);
    });

    document.addEventListener('loadImg-1', function(e) {
      var data = e.detail;
      //set currimage to e
      localStorage.setItem("currimage", JSON.stringify(e.detail));
      model.createImage(data);
    });

    document.addEventListener('loadImg-2', function(e) {
      var data = e.detail;
      view.loadimg(data);
    });

    document.addEventListener('newComment', function(e) {
      //clean form
      document.getElementById("create_comment_form").reset();
      model.createComment(e.detail);
    });

    document.addEventListener('comment-ready', function(e) {
      view.loadComments();
    });

    document.addEventListener('deletecomment', function(e) {
      model.deletecomment(e.detail);
    });
}(model, view));
