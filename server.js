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

const listschema = new mongoose.Schema({
    name: String,
    customlistitems: [itemschema]
});

const List = mongoose.model("List", listschema);

const Item =  mongoose.model("Item", itemschema);

const item1 = new Item({
    name: "Welcome To TO-Do-List."
});
const item2 = new Item({
    name: "click + to add new task."
});
const item3 = new Item({
    name: "Kidda fer."
});

const defaultItems = [item1,item2,item3];

mongoose.connect('mongodb://127.0.0.1:27017/To-Do-ListDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}) 
   .then(function(){
    console.log("Succefully connected to mongoose");
          
             app.get("/", function(req,res){
                
                Item.find()
                  .then(function(founditems){
                    if(founditems.length === 0){
                        Item.insertMany(defaultItems);
                        res.redirect("/");
                       }
                    else{
                        res.render("list" ,{listTitle: day, newListItem: founditems});
                        }
                     });
            });

            app.get("/:customListName", function(req,res){
                const customListName = req.params.customListName;
                  
                List.findOne({name: customListName})
                 .then(function(foundList) {
                    if(!foundList){
                        const newlist = new List({
                            name: customListName,
                            customlistitems: defaultItems
                        });
                        newlist.save();
                        res.redirect("/");
                    }
                    else{
                        res.render("list", {listTitle: customListName, newListItem: foundList.customlistitems});
                    }
                 })
                 .catch(function(err){
                    console.error("Error while fetching data : ", err);
                 });               
            });

            app.post("/", function(req,res){
                const Newinput = req.body.newItem;
                const listName = req.body.list;
                 
                const newitem = new Item({
                    name: Newinput
                });
            
                if(listName === day || listName === "Today")
                {
                    newitem.save();
                    res.redirect("/");
                }
                else{
                    List.findOne({name: listName})
                      .then(function(foundList){
                        foundList.customlistitems.push(newitem);
                        foundList.save()
                         .then(function(){
                            res.redirect("/" + listName);
                         })
                         .catch(function(err){
                            console.error("Error in Rediecting to customList route : ",err);
                         });
                           
                      })

                      .catch(function(err){
                        console.error("Error Found : ", err);
                      });

                }  
            });

            app.post("/delete", function(req,res){
                const checkedItemId = req.body.checkbox;
                const listName = _.capitalize(req.body.listName);

                if(listName === day || listName === "Today")
                {
                    Item.findByIdAndRemove(checkedItemId)
                    .then( function(){
                        res.redirect("/");
                    });
                }
                else{
                   List.findOneAndUpdate({name: listName}, {$pull: {customlistitems: {_id: checkedItemId}}})
                       .then(function(){
                        res.redirect("/" + listName);
                       })
                       .catch(function(err){
                        console.error("Error in redirecting to"+listName+"route",err);
                       }); 
                }

            });
   })

   .catch(err => console.error('Error connecting to MongoDB:', err));

app.listen(3006, function() {
    console.log("Start Hogya Bc");
});
