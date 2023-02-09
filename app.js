const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const {mongo} = require("mongoose");
const _ = require("lodash");
const app = express();

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://wayne299:Burgweinting@cluster0.aoeem8d.mongodb.net/todolistDB", {useNewUrlParser: true});

const itemsSchema = {
    name: String
};

const Item = mongoose.model("Item", itemsSchema);
const defaultItems = [];

const listSchema = {
    name: String,
    items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

app.get("/", function (req, res) {

    Item.find(function (err, result) {
        if (result.length === 0) {
            Item.insertMany(defaultItems, function (err) {
                if (err) {
                    console.log("Error");
                } else {
                    console.log("No Error");
                }
            });
            res.redirect("/");
        } else {
            if (err) {
                console.log("Error");
            } else {
                console.log("Results displayed");
                res.render("list.ejs", {listTitle: "Today", newListItems: result});
            }
        }
    });
});

app.post("/", function (req, res) {
    const itemName = req.body.newitem;
    const listName = req.body.list;

    const item = new Item({
        name: itemName
    });

    if (listName === "Today") {
        item.save();
        console.log("Item Saved");
        res.redirect("/");
    } else {
        List.findOne({name: listName}, function (err, foundList) {
            foundList.items.push(item);
            foundList.save();
            res.redirect("/" + listName);
        });
    }
});

app.post("/delete", function (req, res) {
    const checkItemID = req.body.checkbox;
    const listName = req.body.listName;

    if (listName === "Today") {
        Item.findByIdAndDelete({_id: checkItemID}, function (err) {
            if (err) {
                console.log("Error");
            } else {
                console.log("Item deleted");
            }
            res.redirect("/");
        });
    } else {
        List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkItemID}}}, function (err, foundList) {
            if (!err) {
                res.redirect("/" + listName);
            }
        });
    }


});

app.get("/:customListName", function (req, res) {
    const customListName = _.capitalize(req.params.customListName);

    List.findOne({name: customListName}, function (err, results) {
        if (!err) {
            if (!results) {
                const list = new List({
                    name: customListName,
                    items: defaultItems
                });
                list.save();
                res.redirect("/" + customListName);
            } else {
                res.render("list", {listTitle: results.name, newListItems: results.items});
            }
        }
    });
});

app.listen(3000, function () {
    console.log("Server is running on port 3000");
});