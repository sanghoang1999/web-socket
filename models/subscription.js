var mongoose = require('mongoose');

var subscriptionSchema=mongoose.Schema({
  client_id:{
    type:String,
    default:'emvuidi',
  },
  supscription:String,
})

subscriptionSchema.statics.findSubscription =function(id,callback) {
  Subscription.findOne({id}).then((data)=> {
    callback(data);
  })
}

Subscription = mongoose.model('Subscription',subscriptionSchema);
module.exports = Subscription;