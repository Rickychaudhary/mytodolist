const express = require("express");
const bodyparser = require("body-parser");
const mongoose = require("mongoose");
const ejs = require("ejs");
const date = require(__dirname + "/date.js");
const day = date.getDate();
const path = require('path');
const { log } = require("console");
const _ = require("lodash");


const app = express();
app.set('views', path.join(__dirname, 'views'));

app.set('view engine', 'ejs');

app.use(bodyparser.urlencoded({extended: true}));
app.use(express.static("public"));

const itemschema = new mongoose.Schema({
    name: String
});


const Item =  mongoose.model("Item", itemschema);

const donetask = mongoose.model("Donetask", itemschema);
const defaultItems = [];

mongoose.connect('mongodb://127.0.0.1:27017/To-Do-ListDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}) 
   .then(function(){
    console.log("Succefully connected to mongoose");
          
             app.get("/", function(req,res){
             
                Item.find()
                  .then(function(founditems){
                    donetask.find()
                    .then(function(complete){
                        if(founditems.length === 0){
                            res.render("list" ,{listTitle: day, newListItem: defaultItems, completeditems: complete, completeitemlength: complete.length, Todoitemlength: founditems.length + complete.length});
                        }
                        else{
                                res.render("list" ,{listTitle: day, newListItem: founditems , completeditems: complete, completeitemlength: complete.length, Todoitemlength: founditems.length + complete.length});                    
                        }
                    });                                
                  });
                
            });


            app.post("/", function(req,res){
                const Newinput = req.body.newItem;
                const listName = req.body.list;
                 
                const newitem = new Item({
                    name: Newinput
                }); 
                    newitem.save()
                    res.redirect("/");
     
            
            });

            app.post("/delete", function(req,res){
                const checkedItemId = req.body.checkbox;
                const completetaskname = req.body.doneName;
                    
                  const completetask = new donetask({
                    name: completetaskname
                  });
                    completetask.save();  
                    
                    Item.findByIdAndRemove(checkedItemId)
                    .then( function(){
                        res.redirect("/");
                    })
                    .catch(function(err){
                        console.error("Error while ticking checkbox : ",err);
                    });
            });

            app.post("/delete_completetask",function(req,res){
                const deletebtn = req.body.deletebtn;
                donetask.findByIdAndRemove(deletebtn)
                .then(function(){
                    res.redirect("/");
                })
                .catch(function(err){
                    console.error("Error while deleting completed task : ",err);
                });

            })
   })

   .catch(err => console.error('Error connecting to MongoDB:', err));

app.listen(3006, function() {
    console.log("Start Hogya Bc");
});
