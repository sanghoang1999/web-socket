var express = require('express');
var session = require('express-session');
var Subscription =require('./models/subscription');
var SubscriptionAdmin = require('./models/subscription_admin');
var MongoStore = require('connect-mongo')(session);
var sharedsession  =require('express-socket.io-session');
var webpush = require('web-push');
var app = express();

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/chatbox',{ useNewUrlParser: true });

var db = mongoose.connection;

var ClientUser = require('./models/client');
var chat = require('./models/message');
var user = require('./models/user');

app.set('view engine','ejs');
app.use(session({
    secret: 'emvuidi',
    resave:true,
    saveUninitialized: false,
    store: new MongoStore({
      mongooseConnection: db
    })
}))
var ss= session({
    secret: 'emvuidi',
    resave:true,
    saveUninitialized: false,
    store: new MongoStore({
      mongooseConnection: db
    })
})


app.use(express.urlencoded());
app.use(express.json());
app.use(express.static('public'));

var Router = require('./router/router');
app.use('/',Router);

app.use(function (req, res, next) {
    var err = new Error('File Not Found');
    err.status = 404;
    next(err);
  });

app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.send(err.message);
  });

var server= app.listen(4000,function() {
    console.log('listening');
});


var socket = require('socket.io');
var io=socket(server);
var client = io.of('/client');
var admin = io.of('/admin');

var group = io.of('/admin/group');

group.use(sharedsession(ss));
const ObjectId = mongoose.Types.ObjectId;


const publicVapidKey='BOcmC7yJxUlAD1fLLc5YIGTL8CtITy0LQhLOCDkFuJcL5YJ48-13_cthCsBDYpRQiORiybHh4FNQBM-MSAGfZL4';
const privateVapidKey='L_e8AQM5Bv41bsSANBDgZ4ZYvmppzB-Co_c0b1vEqgE';
webpush.setVapidDetails('mailto:sang.hoang.1999@hcmut.edu.vn',publicVapidKey,privateVapidKey);


client.on('connection',function(socket) {
    socket.on('check',function(id,fn) {
        if(id===null) {
            
            fn(socket.id);
            //socket.join(id);
        }
        else {
            socket.join(id);
            socket.id=id;
            
        }
        chat.find({
            $or: [
                {from:socket.id},
                {to:socket.id},
            ]
        },function(err,result) {
            
            if(err) throw err;
            socket.emit('clientMessages',result);
        })
    })
    socket.on('ClientTyping',function() {
        admin.emit('ClientTyping',socket.id);
    })
    console.log('client join');
    socket.on('oneClientSendMessage',function(msg,fn) {
        ClientUser.updateOne({client_id:socket.id},{$set:{isOnline:true}}).then(()=> {
            admin.emit('clientConnected',socket.id);
        }).catch(err=> {
            throw err;
        })
        console.log('clientChat');
        var newMsg = new chat({from: socket.id,to:'admin',message:msg});
        newMsg.save((err,result)=> {
            if(err) throw err;
            console.log(result);
            admin.emit('messageClientToAdmin',result);
            // gữi tin nhắn nguồi dùng vừa nhắn về cho trang client vào biến result
            //fn(result);
            client.to(socket.id).emit('messageClientToAdmin',result);
            ClientUser.find({'client_id':socket.id}).then(res=> {
                if(res.length==0) {
                    var newClient = new ClientUser({client_id:socket.id});
                    newClient.save((err,result) => {
                        result.unread=1;
                        if(err) throw err;
                        admin.emit('addClient',result);
                    })
                }
            }).catch(err => {
                throw err
            })
        })
    })
    socket.on('disconnect',function() {
        
        ClientUser.updateOne({client_id:socket.id},{$set:{isOnline:false}}).then(()=> {
            admin.emit('clientDisconnect',socket.id);
        }).catch(err=> {
            throw err;
        })
    })
   socket.on('sendSubscription',function(id,data,callback) {
    var subscriptionData = JSON.stringify(data);
    var subscription =new Subscription({client_id:id,supscription:subscriptionData});
    subscription.save((err,data) => {
        if(err) throw err;
        console.log(data);
        callback();
    })
   })
   socket.on('sendNotification',function(admin_id,message) {
    console.log('client send noti');
    SubscriptionAdmin.findOne({admin_id:admin_id}).sort({_id:-1}).then(data=>{
        console.log(data);
        const payload = JSON.stringify({
            title:'Một khách hàng đã gữi tin nhắn',
            body:message,
        });
      
        //Pass object into sendNotification
        subscription=JSON.parse(data.supscription)
        webpush.sendNotification(subscription,payload).then(data=> {
            console.log(data);
        }).catch(err=> {
          console.error(err);
        })
    })
   })
})




admin.on('connection',function(socket) {
    console.log('cc');
      ClientUser.find({}).sort({'_id':-1}).then((result)=> {
        chat.aggregate([
            {$match:{read:false,from:{$ne:"admin"}}},
            {$group:{_id:"$from",message_count:{$sum:1}}},
        ]).exec((err,unread_count) => {

            result=result.map( client => {
                unread_count.map(unread=> {
                    if(client.client_id==unread._id) {
                        client.unread=unread.message_count;
                    }
                })
                return client;
            })
            socket.emit('listClient',result);
        }) 
    }).catch(err=> {
        throw err;
    })
    socket.on('chooseClientToChat',function(user) {
        chat.find({
            $or: [
                {from:user},
                {to:user},
            ]
        },function(err,result) {
            if(err) throw err;
            socket.emit('messagesUserSelected',result);
        })
        chat.updateMany({read:false,from:user},{$set:{read:true}}).then(data=> {
        }).catch(err=> {
            console.log(err);
        })
    })
    socket.on('messageAdminToClient',(message,clientID,fn) => {

        var newMsg = new chat({from:'admin',to:clientID,message:message});
        newMsg.save((err,result) => {
            client.to(clientID).emit('ll','cc');
            if(err) throw err;
            fn(result);
            client.to(clientID).emit('messageAdminToClient',result);    
        })
        
    })
    socket.on('AdminTyping',function(clientId) {
        client.to(clientId).emit("AdminTyping");
    })
    socket.on('sendNotification',function(id,hostname,message) {
        console.log('admin send noti');
        Subscription.findOne({client_id:id}).sort({_id:-1}).then(data=>{
            console.log(data);
            const payload = JSON.stringify({
                title:`${hostname} đã gữi tin nhắn cho bạn`,
                body:message,
            });
          
            //Pass object into sendNotification
            subscription=JSON.parse(data.supscription)
            webpush.sendNotification(subscription,payload).then(data=> {
            }).catch(err=> {
              console.error(err);
            })
        })
    })
    socket.on('sendSubscription',function(admin_id,data,callback) {
        var subscriptionData = JSON.stringify(data);
        var subscription =new SubscriptionAdmin({admin_id:admin_id,supscription:subscriptionData});
        subscription.save((err,data) => {
            if(err) throw err;
            console.log(data);
            callback();
        })
    })
})

group.on('connection',function(socket) {
    var userdata= socket.handshake.session.userData; 
    socket.on('check',function(id_group,fn) {
        if(id_group===null) {
            fn(userdata);
            socket.id=userdata;
        }
        else {
            fn(userdata);
            socket.id=userdata;
        }
        socket.emit('thisUser',userdata);
        chat.aggregate([
            {$project : { id: {$toObjectId :"$from"} ,message:1 ,from:1}},
                    {$lookup:
                    {
                        from: "users",
                        localField: 'id',
                        foreignField: '_id',
                        as: "userInfo"
                    }
                },
                {$project:{
                  userInfo: {password:0,_id:0}
                }}
            ]).exec((err,data)=> {
                if(err) throw err;
                socket.emit('groupMessage',data)
            })
    });

    socket.on('sentMessageToGroup',function(msg) {
        var newMsg = new chat({from:socket.id,to:'group',message:msg});
        newMsg.save().then(()=> {
            chat.aggregate([
                {$sort:{_id:-1}},
                {$limit:1},
                {$project : { id: {$toObjectId :"$from"} ,message:1 ,from:1}},
                {$lookup:
                  {
                    from: "users",
                    localField: 'id',
                    foreignField: '_id',
                    as: "userInfo"
                  }
                },
                {$project:{
                  userInfo: {password:0,_id:0}
                }}
           ]).exec((err,data)=> {
            
               if(err) throw err;
               group.emit('sentMessageToGroup',data);
           }) 
        })
        
    })
})


