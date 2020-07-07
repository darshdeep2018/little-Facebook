const Comment = require('../models/comment');
const Tripplace = require('../models/tripplace');
const multer = require('multer');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images');
    },

    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});

const imageFileFilter = (req, file, cb) => {
    if(!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
        req.flash('error', 'You can upload only image files!');
        cb(res.redirect('back'), false);
    }
    else{
        cb(null, true);
    }
};

const upload= multer({ storage: storage, fileFilter: imageFileFilter});


module.exports = {
  isLoggedIn: (req, res, next)=>{
      if(req.isAuthenticated()){
          return next();
      }
      req.flash('error', 'You must be signed in to do that!');
      res.redirect('/login');
  },
  checkUserTripplace: (req, res, next)=>{
    Tripplace.findById(req.params.id, (err, foundTripplace)=>{
      if(err || !foundTripplace){
          console.log(err);
          req.flash('error', 'Sorry, that tripplace does not exist!');
          res.redirect('/tripplaces');
      } else if(foundTripplace.author.id.equals(req.user._id) || req.user.isAdmin){
          req.tripplace = foundTripplace;
          next();
      } else {
          req.flash('error', 'You don\'t have permission to do that!');
          res.redirect('/tripplaces/' + req.params.id);
      }
    });
  },
  checkUserComment: (req, res, next)=>{
    Comment.findById(req.params.commentId, (err, foundComment)=>{
       if(err || !foundComment){
           console.log(err);
           req.flash('error', 'Sorry, that comment does not exist!');
           res.redirect('/tripplaces');
       } else if(foundComment.author.id.equals(req.user._id) || req.user.isAdmin){
            req.comment = foundComment;
            next();
       } else {
           req.flash('error', 'You don\'t have permission to do that!');
           res.redirect('/tripplaces/' + req.params.id);
       }
    });
  },
  isAdmin: (req, res, next)=> {
    if(req.user.isAdmin) {
      next();
    } else {
      req.flash('error', 'This site is now read only thanks to spam and trolls.');
      res.redirect('back');
    }
  },
  isSafe: (req, res, next)=> {
    if(req.body.image.match(/^https:\/\/images\.unsplash\.com\/.*/)) {
      next();
    }else {
      req.flash('error', 'Only images from images.unsplash.com allowed.\nSee https://youtu.be/Bn3weNRQRDE for how to copy image urls from unsplash.');
      res.redirect('back');
    }
  },
  upload
};