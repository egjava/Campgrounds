var express = require('express');
var router = express.Router();
var passport = require("passport");
var User = require("../models/user");
var async = require('async');
var nodemailer =require("nodemailer");
var crypto = require("crypto");

router.get("/", function(req,res){
    res.render("landing");
})

//Authentication
router.get("/register",function(req,res){
    res.render("register");
});

router.post("/register",function(req,res){
    var newUser= new User({
        username:req.body.username,
        firstname:req.body.firstname,
        lastname:req.body.lastname,
        email:req.body.email
            
    });
    if(req.body.adminCode === 'egss'){
        newUser.isAdmin = true;
    }
   User.register(newUser,req.body.password, function(err,user){
       if(err){
           console.log(err);
           return res.render("register",{error:err.message});
       }
       passport.authenticate("local")(req,res,function(){
           req.flash("success", "Successfully Signed Up! Nice to meet you, "+user.username);
           res.redirect("/campgrounds");
       });
   })
});

router.get("/login", function(req,res){
   res.render("login");
})


router.post("/login",passport.authenticate("local",
   { 
       successRedirect:"/campgrounds",
       failureRedirect: "/login"
   }),  function(req,res){

   });

router.get("/logout",function(req,res){
   req.logout();
   req.flash("success","Logged You Out!!!!!");
   res.redirect("/campgrounds");
})

//User Profile
router.get("/user/:id", function(req,res){
    User.findById(req.params.id, function(err, foundUser){
        if(err){
            req.flash("error", "Something Went Wrong!!");
            res.redirect("/");
        }
        console.log(foundUser);
        res.render("users/show",{user:foundUser});
       
    })
})

//Forgot Password
router.get('/forgot', function(req,res){
    res.render('forgot');
})

router.post('/forgot',function(req,res,next){
    async.waterfall([
        function(done){
            crypto.randomBytes(20, function(err,buf){
                var token= buf.toString('hex');
                done(err,token);
            })
        },
        function(token, done){
            User.findOne({email: req.body.email}, function(err,user){
                if(!user){
                    req.flash('error', 'No account with that email address exists. ');
                    return res.redirect('/forgot');
                }
                user.resetPasswordToken = token;
                user.resetPasswordExpires = Date.now() + 3600000; //1 hour

                user.save(function(err){
                    done(err,token,user);
                });
            });
        },
        function(token, user, done){
            var smtpTransport = nodemailer.createTransport({
                services: 'Gmail',
                auth: {
                    user: 'campgroundsreview@gmail.com',
                    pass: 'Campreview'
                    //pass: process.env.GMAILPW
                }
            });
            var mailOptions = {
                to: user.email,
                from: 'campgroundsreview@gmail.com',
                subject: 'Campgrounds Password Reset',
                text: 'You are receiving this because you (or someone else) have required the reset of the Password.' +
                    'Please click on the following link, or paste this into your browser to complete the process' +
                    'http://localhost:8020/reset/' + token + '/n/n' +
                    'If you did not request this, please ignore this email and your password will remain unchanged'
            };
            smtpTransport.sendMail(mailOptions, function(err){
                console.log('mail sent');
                req.flash('success', 'An email has been sent to  '+ user.email + '  with further instructions.')
                done(err,'done');
            });
        }
    ], function(err){
        if(err) return next(err);
        res.redirect('/forgot');
    });
}); 

//user clicks the link for resetting password 
router.get("/reset/:token", function(req,res){
    User.findOne({resetPasswordToken: req.params.token, resetPasswordExpires: {$gt: Date.now()}}, function(err, user){
        if(!user){
            req.flash('error','Password reset token is invalid or has expired');
            return res.redirect('/forgot');
        }
        res.render('/reset',{token:req.params.token});
    });
});

router.post('/reset/:token', function(req,res){
    async.waterfall([
        function(done){
            User.findOne({resetPasswordToken:req.params.token, resetPasswordExpires: {$gt:Date.now()}}, function(err,user){
                if(!user){
                    req.flash('error','Password reset token is invalid or has expired');
                    return res.redirect('back');
                }
                if(req.body.password === req.body.confirm){
                    user.setPassword(req.body.password,function(err){
                        user.resetPasswordToken = undefined;
                        user.resetPasswordExpires = undefined;

                        user.save(function(err){
                            req.login(user, function(err){
                                done(err,user);
                            });
                        });
                    })
                }else{
                    req.flash("error","Passwords do not match");
                    return res.redirect('back');
                }
            });

        }, function(user,done){
            var smtpTransport = nodemailer.createTransport({
                service: 'Gmail',
                auth: {
                    user: 'campgroundsreview@gmail.com',
                    pass: process.env.GMAILPW
                }
            });
            var mailOptions={
                to: user.email,
                from: 'campgroundsreview@gmail.com',
                subject: 'Your Password has been changed',
                text: 'Hello, \n\n' +
                    'This is a  confirmation that the password for your account' + user.email +'has just changed.'
            };
            smtpTransport.sendMail(mailOptions, function(err){
                req.flash('success','Success! Your password has been changed.');
                done(err);
            });
        }
    ], function(err){
        res.redirect('/campgrounds');
    });
});

//middleware
function isLoggedIn(req, res,next){
   if(req.isAuthenticated()){
       return next();
   }
   req.flash("error","Please Log In!!!!");
   res.redirect("/login");
}

module.exports =router;