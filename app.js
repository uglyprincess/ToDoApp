//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const lodash = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://ugly-princess:iwant2breakFREE@ganymede.lexvg.mongodb.net/todoDB", {useNewUrlParser: true, useUnifiedTopology: true});

const itemSchema = {
  name: String
};

const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({
  name: "Study WebD"
});

const item2 = new Item({
  name: "Watch a movie or a show"
});

const item3 = new Item({
  name: "Play the guitar"
});

const defaultItems = [item1, item2, item3];

const userSchema = {
  name: String,
  items: [itemSchema]
};

const List = mongoose.model("List", userSchema);

app.get("/", function(req, res) {

  Item.find({}, function(err, results){

    if(results.length === 0){
      Item.insertMany(defaultItems, function(err){
        if(err){
          console.log(err);
        } else {
          console.log("Added to the to-do list!");
        }
      });
      res.redirect("/");
    } else {
        res.render("list", {listTitle: "Today", newListItems: results});
    }
  });
});

app.get("/:userListName", function(req, res){

  const userList = lodash.capitalize(req.params.userListName);

  List.findOne({name: userList}, function(err, results){
    if(err) {
      console.log(err);
    } else if (results === null) {
      const list = new List({
        name: userList,
        items: defaultItems
      });

      list.save();
      res.redirect("/" + userList);
    } else {
      console.log("This list exists.");
      res.render("list", {listTitle: results.name, newListItems: results.items});
    }
  });



  // res.render("list", {listTitle: userList, newListItems: list});
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const userItem = new Item({
    name: itemName
  });

  if(listName === "Today") {
    userItem.save();
    res.redirect("/");
  } else {
    List.findOne({name: listName}, function(err, results){
      results.items.push(userItem);
      results.save();
      res.redirect("/" + listName);
    });
  }
});

app.post("/delete", function(req, res){
  const checkedItemID = req.body.deletedItem;
  const listName = req.body.listName;

  if(listName==="Today") {
    Item.findByIdAndDelete(checkedItemID, function(err){
      if (err) {
        console.log(err);
      } else {
        console.log("Lmao fo sho homie");
      }
    });
    res.redirect("/");
  } else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemID}}}, function(err, results){
      if (err) {
        console.log(err);
      } else {
        res.redirect("/" + listName);
      }
    })
  }




});



app.get("/about", function(req, res){
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Server started successfully");
});
