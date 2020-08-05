var express = require("express");
var router  = express.Router();
var Tripplace = require("../models/tripplace");
var Comment = require("../models/comment");
var middleware = require("../middleware");
var { isLoggedIn, checkUserTripplace, upload } = middleware; // destructuring assignment


//INDEX - show all tripplaces
router.get("/", (req, res)=>{
      // Get all tripplaces from DB
      Tripplace.find({}, function(err, allTripplaces){
         if(err){
             console.log(err);
         } else {
              res.render("tripplaces/index",{tripplaces: allTripplaces, page: 'tripplaces'});
         }
      });
});

//CREATE - add new tripplace to DB
router.post("/", isLoggedIn, upload.single('image'), (req, res)=>{
  // get data from form and add to tripplaces array
  var name = req.body.name;
  var image = req.file.filename;
  var desc = req.body.description;
  var author = {
      id: req.user._id,
      username: req.user.username
  }
    var newTripplace = {name: name, image: image, description: desc, author:author/*cost: cost, location: location, lat: lat, lng: lng*/};
    // Create a new tripplace and save to DB
    Tripplace.create(newTripplace, (err, newlyCreated)=>{
        if(err){
            console.log(err);
        } else {
            //redirect back to tripplaces page
            console.log(newlyCreated);
            res.redirect("/tripplaces");
        }
    });
});

//NEW - show form to create new tripplace
router.get("/new", isLoggedIn, (req, res)=>{
    res.render("tripplaces/new"); 
 });

 // SHOW - shows more info about one tripplace
router.get("/:id", (req, res)=>{
    //find the tripplace with provided ID
    Tripplace.findById(req.params.id).populate('comments').exec(function(err, foundTripplace){
        if(err || !foundTripplace){
            console.log(err);
            req.flash('error', 'Sorry, that tripplace does not exist!');
            return res.redirect('/tripplaces');
        }
        console.log(foundTripplace);
        //console.log("yar ho te gya populate");
        
        // tripplace.comments.forEach((comment)=>{
        //     if(err)
        //         return res.redirect('/tripplaces');
        //     console.log(comment.text);
        // });
        //render show template with that tripplace
        res.render("tripplaces/show", {tripplace: foundTripplace});
    });
});

// // EDIT - shows edit form for a tripplace
// router.get("/:id/edit",isLoggedIn ,checkUserTripplace , (req, res)=>{
//   //render edit template with that tripplace
//   res.render("tripplaces/edit", {tripplace: req.tripplace});
// });

// // PUT - updates tripplace in the database
// router.put("/:id", upload.single('imageFile'), (req, res)=>{
//     if (!req.file) {
//         req.flash("error", "something went wrong! try again later");
//         res.redirect("back");
//     }
//     var newData = {name: req.body.name, image: req.file.filename, description: req.body.description};
//     Tripplace.findByIdAndUpdate(req.params.id, {$set: newData}, (err, tripplace)=>{
//         if(err){
//             req.flash("error", err.message);
//             res.redirect("back");
//         } else {
//             req.flash("success","Successfully Updated!");
//             res.redirect("/tripplaces/" + tripplace._id);
//         }
//     });
// });

// DELETE - removes tripplace and its comments from the database
router.delete("/:id", isLoggedIn, checkUserTripplace, (req, res)=>{
    Comment.remove({
      _id: {
        $in: req.tripplace.comments
      }
    }, (err)=> {
      if(err) {
          req.flash('error', err.message);
          res.redirect('/');
      } else {
          req.tripplace.remove((err)=>{
            if(err) {
                req.flash('error', err.message);
                return res.redirect('/');
            }
            req.flash('error', 'Tripplace deleted!');
            res.redirect('/tripplaces');
          });
      }
    })
});

module.exports = router;
