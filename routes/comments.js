const express = require("express");
const router  = express.Router({mergeParams: true});
const Tripplace = require("../models/tripplace");
const Comment = require("../models/comment");
const middleware = require("../middleware");
const { isLoggedIn, checkUserComment, isAdmin } = middleware;

//Comments New
router.get("/new", isLoggedIn, (req, res)=>{
    // find tripplace by id
    console.log(req.params.id);
    Tripplace.findById(req.params.id, (err, tripplace)=>{
        if(err){
            console.log(err);
        } else {
             res.render("comments/new", {tripplace: tripplace});
        }
    })
});

//Comments Create
router.post("/", isLoggedIn, (req, res)=>{
  //lookup tripplace using ID
  Tripplace.findById(req.params.id, (err, tripplace)=>{
      if(err){
          console.log(err);
          res.redirect("/tripplaces");
      } else {
       Comment.create(req.body.comment, (err, comment)=>{
          if(err){
              console.log(err);
          } else {
              //add username and id to comment
              comment.author.id = req.user._id;
              comment.author.username = req.user.username;
              //save comment
              comment.save();
              tripplace.comments.push(comment);
              tripplace.save();
              console.log(comment);
              req.flash('success', 'Created a comment!');
              res.redirect('/tripplaces/' + tripplace._id);
          }
       });
      }
  });
});

router.get("/:commentId/edit", isLoggedIn, checkUserComment, (req, res)=>{
  res.render("comments/edit", {tripplace_id: req.params.id, comment: req.comment});
});

router.put("/:commentId", isAdmin, (req, res)=>{
   Comment.findByIdAndUpdate(req.params.commentId, req.body.comment, (err)=>{
       if(err){
          console.log(err);
           res.render("edit");
       } else {
           res.redirect("/tripplaces/" + req.params.id);
       }
   }); 
});

router.delete("/:commentId", isLoggedIn, checkUserComment, (req, res)=>{
  // find tripplace, remove comment from comments array, delete comment in db
  Tripplace.findByIdAndUpdate(req.params.id, {
    $pull: {
      comments: req.comment.id
    }
  }, (err)=>{
    if(err){ 
        console.log(err)
        req.flash('error', err.message);
        res.redirect('/');
    } else {
        req.comment.remove(function(err) {
          if(err) {
            req.flash('error', err.message);
            return res.redirect('/');
          }
          req.flash('error', 'Comment deleted!');
          res.redirect("/tripplaces/" + req.params.id);
        });
    }
  });
});

module.exports = router;