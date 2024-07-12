"use strict"

var mongoose = require("mongoose");

mongoose.connect("mongodb://localhost:27017/sandbox");

var db = mongoose.connection;

db.on("error", (err) => {
    console.error("connection errors:", err);
});

db.once("open", () => {
    console.log("db connection sucess")
} )