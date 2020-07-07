var express = require("express");
var router  = express.Router();
var passport = require("passport");
var User = require("../models/user");

//root route
router.get("/", (req, res)=>{
    res.render("landing");
});

// show register form
router.get("/register", (req, res)=>{
    res.render("register", {page: 'register'}); 
 });
 
 //handle sign up logic
router.post("/register", (req, res)=>{
    var newUser = new User({username: req.body.username});
    // if(req.body.adminCode === process.env.ADMIN_CODE) {
    //   newUser.isAdmin = true;
    // }
    User.register(newUser, req.body.password,(err, user)=>{
        if(err){
            console.log(err);
            return res.render("register", {error: err.message});
        }
        passport.authenticate("local")(req, res, ()=>{
           req.flash("success", "Successfully Signed Up! Nice to meet you " + req.body.username);
           res.redirect("/tripplaces"); 
        });
    });
});

//show login form
router.get("/login", (req, res)=>{
    res.render("login", {page: 'login'}); 
 });

 //handling login logic
router.post("/login", passport.authenticate("local", 
{
    successRedirect: "/tripplaces",
    failureRedirect: "/login",
    failureFlash: true,
    successFlash: 'Welcome to LittleFacebook!'
}), (req, res)=>{
});

// logout route
router.get("/logout", (req, res)=>{
    req.logout();
    req.flash("success", "See you later!");
    res.redirect("/tripplaces");
 });

 
module.exports = router;