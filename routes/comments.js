var express = require('express');
var router = express.Router({mergeParams:true});
var Comment = require("../models/comment");
var middleware = require("../middleware");

//For Adding New Comments

router.get("/new", middleware.isLoggedIn, function(req,res){
    Campground.findById(req.params.id, function(err,campground){
        if(err || !campground){
           req.flash("errror", "Campground Not Found");
           res.redirect("back");
        }else{
            res.render("comment/newcomments", {campground:campground});
        }
    })
  

})

//Adding New comments in database

router.post("/", middleware.isLoggedIn,  function(req,res){
    Campground.findById(req.params.id,function(err,campground){
        if(err || !campground){
            req.flash("errror", "Campground Not Found");
         
            res.redirect("/campgrounds");
        }else{
            Comment.create(req.body.comment, function(err, newComment){
                if(err){
                    req.flash("error","Something went wrong!!");
                    console.log("Error while creating new Comment");
                }else{
                    newComment.author.id = req.user._id;
                    newComment.author.username = req.user.username;
                    newComment.save();
                    campground.comments.push(newComment);
                    campground.save();
                    req.flash("success"," Successfully Added");
                     res.redirect('/campgrounds/'+ campground._id);
                }
            })
        }
    })
    
  
   
 })
 //comments Edit and Update Route
 router.get("/:comment_id/edit",middleware.checkCommentOwnership ,function(req,res){
     Comment.findById(req.params.comment_id,function(err, foundComment){
        
            if(err || !foundComment){
                req.flash("errror", "Comment Not Found");
                res.redirect("back");
         }else{
             res.render("comment/edit",{campground_id: req.params.id, comment:foundComment})
         }
     })
 })
 router.put("/:comment_id",middleware.checkCommentOwnership, function(req, res){
     Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err,updateComment){
       
         if(err){
            res.redirect("back");
         }else{
             res.redirect("/campgrounds/"+ req.params.id);
         }
     })
 })
 //Comments Destroy Route
 router.delete("/:comment_id", middleware.checkCommentOwnership ,function(req,res){
     Comment.findByIdAndRemove(req.params.comment_id, function(err, foundComment){
         if(err){
            res.redirect("back");
         }else{
             req.flash("success","Comment deleted")
             res.redirect("/campgrounds/"+ req.params.id);
         }
     })
 })

 module.exports =router;