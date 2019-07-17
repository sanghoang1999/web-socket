var express = require('express');
var router = express.Router();
var path = require('path');
var User = require('../models/user');
var Subscription = require('../models/subscription');
var webpush = require('web-push');
router.get('/login',function(req,res) {
    return res.render('index');
})

router.post('/login',function(req,res,next) {
    if (req.body.password !== req.body.passwordConf) {
        var err = new Error('Passwords do not match.');
        err.status = 400;
        res.send("passwords dont match");
        return next(err);
    }
    if(req.body.email&& req.body.username && req.body.password && req.body.passwordConf) {
        var userData = {
            email: req.body.email,
            username: req.body.username,
            password: req.body.password,
        }
        User.create(userData,function(err,user) {
            if(err) 
            throw err;
            else {
                req.session.userData = user._id;
                return res.render('admin',{email:user.email});
            }
        })
         
    }
    else if(req.body.logemail && req.body.logpassword) {
        User.authenticate(req.body.logemail,req.body.logpassword,function(err,user) {
            if(err || !user) {
                var err = new Error('Wrong email or password.');
                err.status = 401;
                return next(err);
            }else {
                req.session.userData=user._id;
                return res.render('admin',{name:user.email});
                return res.redirect('admin');
            }
        }) 
    }
})

router.get('/logout',function(req,res,next) {
    if(req.session) {
        req.session.destroy(err => {
            if(err)
                return next(err);
            else {
                return res.redirect('/login');
            }
        })
    }
})

router.get('/admin',function(req,res) {
    
    if(req.session.userData) {
        User.findOne({_id:req.session.userData},(err,user) => {
            if(err) throw err;
            return res.render('admin',{name:user.username});
        })
        
    }
    else {
        res.redirect('/login');
    }
})

router.get('/admin/group',function(req,res,next) {
    if(req.session.userData) {
        res.render('group');
    }
    else res.redirect('/login');
})
router.get('/client',function(req,res) {
    return res.render('client');
})
const publicVapidKey='BOcmC7yJxUlAD1fLLc5YIGTL8CtITy0LQhLOCDkFuJcL5YJ48-13_cthCsBDYpRQiORiybHh4FNQBM-MSAGfZL4';
const privateVapidKey='L_e8AQM5Bv41bsSANBDgZ4ZYvmppzB-Co_c0b1vEqgE';
webpush.setVapidDetails('mailto:sang.hoang.1999@hcmut.edu.vn',publicVapidKey,privateVapidKey);

// router handle post request push notification



router.post('/save-subscription',  (req, res) => {
    console.log(req.body);
    var subscriptionData = JSON.stringify(req.body);
    var subscription =new Subscription({client_id:'1',supscription:subscriptionData});
    subscription.save((err,data) => {
        if(err) throw err;
        console.log(data);
    })
    res.json({ message: 'success' })
})


router.post('/subscribe', async  (req,res)=> {
    //get push
    Subscription.findOne({client_id:'1'}).then(data=>{
        res.status(201).json({message:'send'});
        const payload = JSON.stringify({title:'Push Test'});
      
        //Pass object into sendNotification
        subscription=JSON.parse(data.supscription)
        webpush.sendNotification(subscription,payload).then(data=> {
            console.log(data);
        }).catch(err=> {
          console.error(err);
        })
    })
    // send 201 - resource created

  })
  

module.exports =router;