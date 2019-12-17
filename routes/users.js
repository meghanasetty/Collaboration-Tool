/**
 * Created by MEGHANA on 20-09-2015.
 */


//server
var express=require("express");
var sess={};
//routes
var router=express.Router();
var bcrpyt=require("bcrypt");
//var app=require("../app.js");
//var db=app.db;
//pool of template engines


//body parser for geting the form inputs
router.use(bodyparser());
router.use(session({secret:"secretkey"}));


//logout

router.get("/logout",function(req,res,next){
    req.session.destroy(function(err){
        if(err){
            console.log(err);
        }
        else
        {
            res.redirect("/");
        }
    });
});
//register
router.get('/register',function(req,res,next){
 res.render("signup");
});

//login
router.get('/',function(req,res,next){
    res.render("login");
});

//loginuser
router.post('/loginuser',function(req,res,next) {
    var email=req.body.email;
    var pwd=req.body.pwd;
    var findCollection={'_id':email};
    db.collection('person').findOne(findCollection,function(err,doc){
        if(err) {throw err;}
        bcrpyt.compare(pwd,doc.password,function(err,result){
            if(result===true)
            {   //assigning seesion id
                sess=req.session;
                sess.email=req.body.email;
                sess.pwd=doc.password;
               // console.log("came /loginuser");
                res.redirect('/homepage');
            }
            else
            {
                res.send("password/email is incorrect");
            }
        });
    });

});
//details entered
router.post('/signup',function(req,res,next){
    var name=req.body.name;
    var designation=req.body.designation;
    var pwd=req.body.pwd;
    var email=req.body.email;
    var address=req.body.address;
    var phoneno=req.body.phoneno;
    var gender=req.body.gender;

    bcrpyt.genSalt(10,function(err,salt)
    {
        bcrpyt.hash(pwd,salt,function(err,hash){
            var insertDoc={'name':name,'designation':designation,
                'password':hash, '_id':email , 'address':address,
                'phone':phoneno , 'gender':gender, 'projects':[],
                'posts':[]};
            db.collection('person').insertOne(insertDoc,function(err,doc){
        if(err)
        {
            if(err.code==11000)
            {
                console.log("email already exits");
                res.send("<html><body>User already exits<br /><a href='/'>login</a></body></html>");
            }
            else
            {
                throw err;
            }
        }
        else
        {
            console.log(doc);
            res.render("login");
        }
            });
});
    });
});

module.exports=router;