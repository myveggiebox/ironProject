const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");
const salt = bcrypt.genSaltSync(10);  // const bcryptSalt = 10 diferencia ??

//passport
const passport = require("passport");

//ensureLogin
const ensureLogin = require("connect-ensure-login");


//facebook login
router.get("/authentification/facebook", passport.authenticate("facebook", {scope: 'email'}));
router.get("/authentification/facebook/callback", passport.authenticate("facebook", {
    successRedirect: "/private-meal-page",
    failureRedirect: "/login"
}));
//facebook login


// Para el Login
router.get("/login", (req, res, next) => {
    res.render("authentification/login",{"message": req.flash("authentification error")} );
  });
  
router.post("/login", passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,   
    passReqToCallback: true,
    successRedirect: "/private-meal-page", 
  }));


  // Logout
  router.get("/logout", (req, res) => {
    req.logout();
    res.redirect("/");
  });

// Para el Signup
router.get("/signup", (req,res, next)=>{
    res.render("authentification/signup");
})

.post("/signup", (req,res,next)=>{
    const username = req.body.username,
          email = req.body.email,
          address = req.body.address,
          password = req.body.password;
    if(username === "" || password === "" || email === "" || address === ""){
        res.render("authentification/signup", {message: "Indicate username, password, email and your address"});
        return;
    }
if(password != req.body.password2){
    res.render("authentification/signup", {message: "Your passwords don't match"});
    return;
}
    User.findOne({username}, "username", (err, user)=>{
       if (user !== null){
           res.render("authentification/signup", {message:"The username already exists"});
           return;
       }

       const hashPass = bcrypt.hashSync(password, salt);

       const newUser = new User({
          username,
          email,
          address,
          password:hashPass
       });
console.log(newUser)
       newUser.save()
        .then(()=>res.redirect('/'))
       .catch(err => console.log(err))
    });
});

// Private Meal Page access
router.get("/private-meal-page", ensureLogin.ensureLoggedIn(), (req, res) => {
    res.render("privateMeal", { user: req.user });
  });




  // Cart Access
router.get("/my-cart", ensureLogin.ensureLoggedIn(), (req, res) => {
    res.render("cart", { user: req.user });
  });

module.exports = router;