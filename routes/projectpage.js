/**
 * Created by MEGHANA on 30-09-2015.
 */
//server
var express=require("express");
//routes
var router=express.Router();
var fs=require("fs");
var cons=require("consolidate");
var bodyparser=require("body-parser");
var sess={};
var gloposts=[];
var gloteam=[];
router.use(bodyparser());
router.get("/:projectname",function(req,res) {
    var projectname=req.params.projectname;
    sess=req.session;
    sess.projectname=projectname;
    var pagedetail=sess.pagedetail;
    var projectdetail={
        'pagedetail':pagedetail,
        'projectname':projectname,
        'posts':[],
        'team':[]
    };
    db.collection("project").findOne({"name":projectname},function(err,doc){
        if(err)
        {
            console.log("err :/projectpage");
            throw err;
        }
        addPosts(doc,function(){
         //   console.log("posts:\n\n"+gloposts);
            for(var i=0;i<gloposts.length;i++)
                projectdetail.posts[i]=JSON.stringify(gloposts[i]);
            addteam(doc,function(){
           //     console.log("team:\n\n"+gloteam);
                for(var i=0;i<gloteam.length;i++)
                    projectdetail.team[i]=JSON.stringify(gloteam[i]);
             //   console.log("projectdetails::  "+JSON.stringify(projectdetail));
                res.render("projectPage",projectdetail);
            });
            });
    });
    //res.send(projectname+"  "+JSON.stringify(projectdetail));
});

var addPosts = function(doc_project, callback) {

    var count = 0;
    gloposts=[];
    if(doc_project.posts.length > 0) {
        for (var j = 0; j < doc_project.posts.length; j++) {

            (function (j) {

                db.collection("post").findOne({
                    "_id": doc_project.posts[j]
                }, function (err, doc_post) {
               //     console.log("post:\n" + doc_post);
                        gloposts.push(doc_post);

                    count++;
                 //   console.log("count " + count);
                    if (count === doc_project.posts.length) {
                        callback();
                    }
                });

            }(j));
        }
    }
    else  {
        callback();
    }

};
var addteam = function(doc_project, callback) {

    var count = 0;
    gloteam=[];
   // console.log("team:::::"+doc_project.team);
    if(doc_project.team.length > 0) {
        for (var j = 0; j < doc_project.team.length; j++) {

            (function (j) {
                db.collection("person").findOne({
                    "_id": doc_project.team[j]
                }, function (err, doc_person) {
                   if(err)
                   {
                       console.err("err in addteam");
                       throw err;
                   }
       //             console.log("team:\n" + doc_person);
                    gloteam.push(doc_person.name);
                    count++;
     //               console.log("count " + count);
                    if (count === doc_project.team.length) {
                        callback();
                    }
                });

            }(j));
        }
    }
    else  {
        callback();
    }

};


router.post("/addpost",function(req,res){
    sess=req.session;
    //console.log("addpost"+JSON.stringify(sess));
   // console.log("in add post:::\n\n");
    var post={
        'message':req.body.postcontent,
        'project':sess.projectname,
        'date':new Date(),
        'postedby':sess.name,
        'comments':[]
    };
    db.collection("post").insertOne(post,function(err,insertstatus){
        if(err)
        {
            console.log("post creation error");
            throw err;
        }
        db.collection("post").findOne(post,function(err,postdoc){
           var postid=postdoc._id;
            db.collection("person").findOne({"name":sess.name},function(err,persondoc){
                var posts=persondoc.posts;
                posts.unshift(postid);
                db.collection("person").updateOne({"name":sess.name},{$set:{"posts":posts}},function(err,result){
                    if(err)
                    {
                        console.log("error person post");
                        throw err;
                    }
                });

            });
            db.collection("project").findOne({"name":sess.projectname},function(err,projectdoc){
     //           console.log("project doc"+JSON.stringify(projectdoc));
                var posts=projectdoc.posts;
                posts.unshift(postid);
       //         console.log(posts);
                db.collection("project").updateOne({"name":sess.projectname},{$set:{"posts":posts}},function(err,result){
                    if(err)
                    {
                        console.log("error person post");
                        throw err;
                    }
                    addPosts(projectdoc,function(){
         //               console.log("posts:\n\n"+gloposts);
                        for(var i=0;i<gloposts.length;i++)
                        gloposts[i]=JSON.stringify(gloposts[i]);
                        res.render("projectPage",{
                            'pagedetail':sess.pagedetail,
                            'projectname':sess.projectname,
                            'posts':gloposts
                        });
                    });

                });

            });

        });
    });
});
router.get("/",function(req,res)
{
    res.render("CreateProject",{'username':req.session.name});
});

router.post("/create",function(req,res)
{
    //console.log("came to create :)");
    var projectname=req.body.name;
    var timeofCreation=new Date();
    var posts=[];
    var des=req.body.des.trim();
    var createdby=req.session.email;
    var team=req.body.teammems.split(",");
    var projectdetails={"name":projectname,"team":team,"posts":posts,"createdby":createdby,"timeofCreation":timeofCreation,"des":des};
    db.collection("project").insertOne(projectdetails,function(err,insertstatus) {
        if (err) {
            console.log("project creation error");
            throw err;
        }
        db.collection("project").findOne(projectdetails, function (err, prodoc) {
            db.collection("person").findOne({"_id": prodoc.createdby}, function (err, perdoc) {
                if (perdoc.projects.indexOf(prodoc._id) == -1) {
                    {
                        perdoc.projects.push(prodoc._id);
                //        console.log("projectpage:"+perdoc);
                        db.collection("person").updateOne({_id:perdoc._id}, {$set:{"projects":perdoc.projects}}, function(err, result) {
                            if (err)
                            {
                                console.log("creator updation error");
                            throw err;
                            }
                                });
                    }
                }
                var teams=0;
                for (teams = 0; teams < team.length; teams++) {
                  //  console.log("project document" + prodoc);
                  //  console.log("team " + prodoc.team);

                    db.collection("person").findOne({"_id": prodoc.team[teams]}, function (err, perdoc) {
                        if (perdoc.projects.indexOf(prodoc._id) == -1) {
                            {
                                perdoc.projects.push(prodoc._id);
                                db.collection("person").updateOne({_id:perdoc._id}, {$set:{"projects":perdoc.projects}}, function(err, result) {
                                    if (err)
                                    {
                                        console.log("team updation error");
                                        throw err;
                                    }
                                });
                            }
                        }

                    });


                }
                while(1){
                    if(teams==team.length)
                    {
                        res.redirect("/homepage");
                        break;
                    }
                }
            });
        });
    });

});

var receiver;
router.get("/chat/:receiver",function(req,res){
    receiver=req.params.receiver;
    res.render("chat",{'receiver':receiver});
});

var filenames=[];
router.get("/sharefile/:receiver",function(req,res){
    var receiver=req.params.receiver;
    console.log("came here\n");
    findfiles(db, function() {
        res.render("sharefile",{'receiver':receiver,'filenames':filenames.toString()});
    });


});
var findfiles = function(db, callback) {
    var cursor =db.collection('files').find( );
    cursor.each(function(err, doc) {
        if(err)
        {throw err;}
        if (doc != null) {
            console.log(doc.name);
            filenames.push(doc.name);
        } else {
            callback();
        }
    });
};

router.post("/filesend",function(req,res){
    var filename=req.body.filename;
    var content=req.body.content;
    console.log(content);
    console.log(filename);
    var file={'name':filename, 'content':content};
    db.collection("files").insertOne(file,function(err,insertstatus) {
        if (err) {
            console.log("file creation error");
            throw err;

        }
        res.send("file shared successfully");
    });

    });

router.get("/storefile/:filename",function(req,res) {
    var filename = req.params.filename;
    db.collection("files").findOne({"name": filename}, function (err, perdoc) {
     var content=perdoc.content;

        res.writeHead(200,{"Content-Type":"text/plain"});
        res.end("file name:"+filename+"\n\n"+content);
    });

});
router.get("/teamviewing/:receiver",function(req,res){
    var receiver=req.params.receiver;
    res.send("teamviewing"+receiver);
});
module.exports=router;
