var express = require('express');
var router = express.Router({mergeParams:true});
var Campground = require("../models/campground");
var Review = require("../models/review");
var middleware = require("../middleware");

//For image Upload

var multer = require('multer');
var storage = multer.diskStorage({
  filename: function(req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});
var imageFilter = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
var upload = multer({ storage: storage, fileFilter: imageFilter})

var cloudinary = require('cloudinary');

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET, 
});


//campground route
router.get("/", function(req,res){
    var noMatch="";
    if(req.query.search){
        const regex = new RegExp(escapeRegex(req.query.search), 'gi'); 
       // const regex = new RegExp(escapeRegex(req.query.search),'gt');
        
        Campground.find({name:regex}, function(err,allcampgrounds){
            if(err){
               console.log("Error while finding campgrounds");
           }
           else{
               
               if(allcampgrounds.length < 1 ){
                    noMatch ="No campgrounds match that query. Please try again";
               }
               res.render("campground/campgrounds",{campgrounds:allcampgrounds,noMatch:noMatch});
           }

       });

    }
    else{
    //GEt from database
         Campground.find({}, function(err,allcampgrounds){
             if(err){
                console.log("Error while finding campgrounds");
            }
            else{
                res.render("campground/campgrounds",{campgrounds:allcampgrounds,noMatch:noMatch});
            }

        });
    }
   
})
//Create - add new campground to DB
router.post("/", middleware.isLoggedIn, upload.single('image'), function(req,res){
    
    cloudinary.v2.uploader.upload(req.file.path, function(err,result) {
        if(err){
            req.flash('error',err.message);
            return res.redirect('back');
        }
        // add cloudinary url for the image to the campground object under image property
       
        req.body.campground.image = result.secure_url;
        //add public_id to the imageId in campground db
        req.body.campground.imageId = result.public_id;
        // add author to campground
        req.body.campground.author = {
          id: req.user._id,
          username: req.user.username
        }
        Campground.create(req.body.campground, function(err, campground) {
            
          if (err) {
            req.flash('error', err.message);
            return res.redirect('back');
          }
          res.redirect('/campgrounds/' + campground.id);
        });
      });
})

router.get("/new", middleware.isLoggedIn, function(req,res){
    res.render("campground/newcampground");

})

router.get("/:id", function(req,res){
    
    Campground.findById(req.params.id).populate('comments').populate({
        path:"reviews",
        options:{sort: {createdAt: -1}}
    }).exec(function(err,foundCampground){
        if(err || !foundCampground)
        {
            req.flash("error", err.message);
            res.redirect("back");
        }else{
           
            res.render("campground/show", {desccampgrounds:foundCampground});
            
        }
    });
   

});
//EDIT ROUTE

router.get("/:id/edit",middleware.checkCampgroundOwnership, function(req,res){
    Campground.findById(req.params.id,function(err, foundCampground){
        if(err || !foundCampground){
            req.flash("error", err.message);
            res.redirect("back");
        }else{
            res.render("campground/edit",{campgrounds:foundCampground});
        }
    })
});

//UPDATE ROUTE
router.put("/:id",middleware.checkCampgroundOwnership, upload.single('image'), function(req,res){
    Campground.findById(req.params.id, async function(err, campground){
        if(err){
            req.flash("error", err.message);
            res.redirect("back");
        } else {
            if (req.file) {
              try {
                  await cloudinary.v2.uploader.destroy(campground.imageId);
                  var result = await cloudinary.v2.uploader.upload(req.file.path);
                  campground.imageId = result.public_id;
                  campground.image = result.secure_url;
              } catch(err) {
                  req.flash("error", err.message);
                  return res.redirect("back");
              }
            }
           /* campground.name = req.body.name;
            campground.description = req.body.description;*/
            campground.name = req.body.name;
				campground.description = req.body.description;
				campground.price = req.body.price;
				          
            await campground.save();
            req.flash("success","Successfully Updated!");
            res.redirect("/campgrounds/" + campground._id);
        }
    });
});
   

//Destroy Route
router.delete("/:id",middleware.checkCampgroundOwnership, function(req,res){
   
    Campground.findById(req.params.id,function(err,campground){
        if(err){
            res.redirect("/campgrounds");
        }else{
            cloudinary.v2.uploader.destroy(campground.imageId);
             // deletes all comments associated with the campground
             Comment.remove({"_id": {$in: campground.comments}}, function (err) {
                if (err) {
                    console.log(err);
                    return res.redirect("/campgrounds");
                }
                // deletes all reviews associated with the campground
                Review.remove({"_id": {$in: campground.reviews}}, function (err) {
                    if (err) {
                        console.log(err);
                        return res.redirect("/campgrounds");
                    }
                    //  delete the campground
		    campground.remove();
		    req.flash("success", "Campground Deleted!");
		    res.redirect("/campgrounds");
            
        });
    })
    }
});
})
//middleware


function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};


module.exports =router;

