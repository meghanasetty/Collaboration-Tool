/**
 * Created by MEGHANA on 19-09-2015.
 */

var express=require("express");
//socket.io
var app=express();
var http = require('http').Server(app);
io = require('socket.io')(http)
//sessions
session=require('express-session');
bodyparser=require("body-parser");


var users=require("./routes/users");
var homepage=require("./routes/homepage");
var projectpage=require("./routes/projectpage");
var cons=require("consolidate");
//var db;

//database
var mongodb=require("mongodb");
//mongodb connection
var MongoClient=mongodb.MongoClient;

//function to initialize connection
MongoClient.connect("mongodb://meghana:1234@localhost:27017/coll_db",function(err,database)
{
  if(err) {
    console.log("error connectiong"+err);
    throw err;
  }
  console.log("connection successful");
  db=database;
});
app.use(express.static('public'));
app.engine("html",cons.swig);
app.set('view engine','html');
app.set('views',__dirname+"/views");

app.use("/",users);
app.use("/homepage",homepage);
app.use("/projectpage",projectpage);
app.use(session({secret:"secretkey"}));
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({extended:true}));
app.get("*",function(req,res,next)
{
  var err=new Error('not Found');
  err.status=404;
  next(err);
});

app.use(function(err,req,res,next)
{
  res.status(err.status);
  res.send(err.message+"   "+err);
});

//app.listen(3001);

module.exports=app;
var mesgs=[];
io.on('connection', function(socket){
  console.log('a user connected');
  io.emit('reload',mesgs);
  socket.on('chat message', function(msg){
    console.log(msg);
    mesgs.push(msg);
    console.log(mesgs);
//       io.emit('chat message', msg);

  });

  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
});
http.listen(3002, function(){
  console.log('listening on *:3002');
});
