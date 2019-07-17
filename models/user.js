
var mongoose = require('mongoose');
var message =require('../models/message');
var UserSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    required: true,
    trim: true
  },
  username: {
    type: String,
    unique: true,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
  }
});
UserSchema.statics.authenticate= function(email,password,callback) {
    User.findOne({
      $and : [
        {email:email},
        {password:password}
      ]
    }).exec((err,user)=> {
      if(err) return callback(err);
      else if(!user) {
        var err = new Error("User not found");
        err.status= 401;
        return callback(err);
      }
      else return callback(null,user);
    })
}
var User = mongoose.model('User', UserSchema);
module.exports =User