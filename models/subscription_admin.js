var mongoose = require('mongoose');

var subscriptionSchema=mongoose.Schema({
  admin_id:{
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

Subscription = mongoose.model('SubscriptionAdmin',subscriptionSchema);
module.exports = Subscription;