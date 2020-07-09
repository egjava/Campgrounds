var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var userSchema = new mongoose.Schema({
    username:{type:String, unique:true, required: true},
    firstname:String,
    lastname:String,
    email:{type:String, unique:true, required: true},
    password: String,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    isAdmin: {type: Boolean, default: false}
   
});
userSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("user", userSchema)

