var mongoose = require('mongoose');
var User = require('../models/user');
var messageSchema=mongoose.Schema({
  from:{
    type:String,
    ref:'User',
  },
  to:String,
  message:String,
  read:{
    type:Boolean,
    default:false,
  },
  created:{
      type:Date,
      default:Date.now
  }
})


Message = mongoose.model('Message',messageSchema);
module.exports = Message;