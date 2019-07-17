
var mongoose = require('mongoose');
var clientSchema=mongoose.Schema({
  isOnline:{
    type:Boolean,
    default:true,
  },
  client_id:String,
  unread:{
    type:Number,
    default:0,
  }
})
module.exports = mongoose.model('Client',clientSchema);