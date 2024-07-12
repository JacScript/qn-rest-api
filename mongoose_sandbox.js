// "use strict"

// // import { Schema, model, models , mongoose} from "mongoose";


// var mongoose = require("mongoose");

// mongoose.connect("mongodb://localhost:27017/sandbox");

// var db = mongoose.connection;

// db.on("error", (err) => {
//     console.error("connection errors:", err);
// });

// db.once("open", () => {
//     console.log("db connection sucessfull");

//     //All database communication goes here

//     var Schema = mongoose.Schema;
//     var AnimalSchema = new Schema({
//         type: String,
//         size: String,
//         color: String,
//         mass: Number,
//         name: String
//     });

//     // var Animal = mongoose.model("Animal", AnimalSchema);
//     var models = mongoose.models;
//     var model = mongoose.model;
//     const AnimalModel = models.animal || model('animal', AnimalSchema)

//     var elephant = new AnimalModel({
//         type: "elephant",
//         size: "big",
//         color: "grey",
//         mass: 9000,
//         name: "Loyce"
//     });


//     elephant.save();
//         db.close();
//     })
    