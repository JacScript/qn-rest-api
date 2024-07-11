"use strict"

//imports
var express = require("express");
var  appication = express();


//port number
var port = process.env.PORT || 3000

//middleware
appication.use((request,response,next) => {
    console.log("The Leaves on the trees are", request.query.color);
    next();
});

appication.listen(port, () => {
    console.log(`Express server is listening on port ${port}`)
})