/**
 * Created by MEGHANA on 21-09-2015.
 */
//server
var express = require("express");
//routes
var router = express.Router();
var cons = require("consolidate");
var bodyparser = require("body-parser");
var sess = {};
var pagedetail={};
var addPosts = function(doc_project, callback) {

    var count = 0;
    pagedetail.posts=[];
    if(doc_project.posts.length > 0) {
        for (var j = 0; j < doc_project.posts.length; j++) {

            (function (j) {

                db.collection("post").findOne({
                    "_id": doc_project.posts[j]
                }, function (err, doc_post) {
                    doc_post=JSON.stringify(doc_post);
                    console.log("post:\n" + doc_post);
                    if (pagedetail.hasOwnProperty("posts"))
                        pagedetail.posts.push(doc_post);
                    else
                        pagedetail.posts = [doc_post];

                    count++;
                    console.log("count " + count);
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

//added callback param to the function signature.
var homepageRenderValues = function(param, callback) {

    var req = param.req;
    var res = param.res;
    sess = req.session;
    if (sess.email && sess.pwd) {
        var details = {
            "_id": sess.email,
            "password": sess.pwd
        };
        db.collection("person").findOne(details, function(err, doc_person) {
            sess.name = doc_person.name;
            pagedetail.username = sess.name;
            pagedetail.name = doc_person;
            pagedetail.project_names=[];
            console.log("page detail:  "+JSON.stringify(pagedetail));
            var i = 0;
            var index = 0;
            //we have to make this loop to behave synchronously.
            for (i = 0; i < doc_person.projects.length; i++) {
                (function(i) {
                    db.collection("project").findOne({
                            "_id": doc_person.projects[i]
                        },
                        function(err, doc_project) {

                            //If the pagedetails object has the key project_names, update the array, else

                            //create a new array.
                            if (pagedetail.hasOwnProperty("project_names")) {
                                pagedetail.project_names.push(doc_project.name);
                            } else {
                                pagedetail.project_names = [doc_project.name];
                            }
     /*                       index++;
                            console.log("index "+index);
                            if(index === doc_person.projects.length) {
                                callback(pagedetail);
                            }
         */                   //call the inner method..
                            addPosts(doc_project, function() {
                                index++;
                           //     console.log("index "+index);
                                if(index === doc_person.projects.length) {
                           //         console.log("pagedetail "+JSON.stringify(pagedetail));
                                    sess.pagedetail=pagedetail;
                                    callback(pagedetail);
                                }
                            });
                });

                }(i));
            }
            if(i==0)
            callback(pagedetail);

        });

    }
    else
    {
     //   console.log("in else "+JSON.stringify(pagedetail));
        callback(pagedetail);
    }
};

router.get("/", function(req, res) {
    var param = {
        "req": req,
        "res": res
    };

    //function definition takes single parameter and here there are two? 

    //same thing should reflect in the defn.
   // console.log("came /homepage");
    homepageRenderValues(param, function(doc) {
     //   console.log("in while "+JSON.stringify(doc));
       // if (sess.email && sess.pwd) {
       //     console.log("came here");
           // doc.project_names = JSON.stringify(doc.project_names);
//Object.keys(doc).length > 0
            //doc.posts = JSON.stringify(doc.posts);
            res.render("homePage", doc);
       //}
    //else {
      //      res.write("<html><body><h1>login first</h1><br />");
        //    res.end("<a href='/' >login</a></body></html>");
       // }
    });
});


module.exports = router;