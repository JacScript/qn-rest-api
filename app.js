"use strict"

//imports
var express = require("express");
var  application = express();
var routes = require("./routes");


var jsonParser = require("body-parser").json  //has multiple parse to manage http request
var logger = require("morgan");


//port number
var port = process.env.PORT || 3000

application.use(logger("dev"));
application.use(jsonParser());

//handling routes
application.use("/questions", routes);


//catch 404 and forward to error handleer
application.use((request, response, next) => {
   var err = new Error("Not Found");
   err.status = 404;
   next(err);
});

//Error Handler
application.use((error, request, response, next) => {
    response.status(error.status || 500);
    response.json({
        error: {
            message: error.message
        }
    })
})

application.listen(port, () => {
    console.log(`Express server is listening on port ${port}`)
})