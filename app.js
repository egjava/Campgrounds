require("dotenv").config(); //for .env file
var express= require('express');
 app= express(),
 bodyParser = require("body-parser"),
 mongoose = require("mongoose"),
 passport = require("passport"),
 LocalStrategy = require("passport-local");
 Campground = require("./models/campground"),
 Comment = require("./models/comment"),
 seedDB = require("./seed"),
 User = require("./models/user"),
methodOverride = require('method-override'),
flash = require("connect-flash"),



commentRoutes = require("./routes/comments"),
 campgroundRoutes = require("./routes/campgrounds"),
 reviewRoutes     = require("./routes/reviews"),
 indexRoutes = require("./routes/index"),


 //seedDB();

 //passport configuration

 app.use(require("express-session")({
     secret:" This is a text",
     resave:false,
     saveUninitialized: false 
 }));
 
app.locals.moment = require('moment');


app.use(methodOverride("_method"));
 app.use(passport.initialize());
 app.use(passport.session());
 passport.use(new LocalStrategy(User.authenticate()));
 passport.serializeUser(User.serializeUser());
 passport.deserializeUser(User.deserializeUser());

 

app.use(bodyParser.urlencoded({extended:true}));
mongoose.connect("mongodb://localhost:27017/camp",{useNewUrlParser:true, useUnifiedTopology: true});
app.use(express.static(__dirname+ "/public"));
app.use(flash());
app.use(function(req,res,next){
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});


app.set("view engine","ejs");
app.use("/", indexRoutes);
app.use("/campgrounds/:id/comments", commentRoutes);
app.use("/campgrounds",campgroundRoutes);
app.use("/campgrounds/:id/reviews", reviewRoutes);



app.listen(8020);