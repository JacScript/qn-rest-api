 "use strict"

// //imports
const express = require("express");
const  application = express();
const routes = require("./routes");
const dotenv = require("dotenv")
const mongoose = require("mongoose")


var jsonParser = require("body-parser").json  //has multiple parse to manage http request
var logger = require("morgan");

dotenv.config();

const port = process.env.PORT || 5000;
const MONGOURL = process.env.MONGO_URL;

application.use(express.json());

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
});


 

async function connectWithRetry() {
    try{

        //connecting to mongo db database
        const databaseConnected = await mongoose.connect(MONGOURL);


        //verifying the database is connected
        if(databaseConnected){
            application.listen(port, () => {
                console.log(`database has been connected and server is running on port ${port}`)
            });

        } else {
            console.log('Database connection  failed');
            setInterval(connectWithRetry, 5000)
        }
    } catch(error){
       console.log(`Database connection error: ${error}`)
       setInterval(connectWithRetry, 5000) ;    
    }
}

connectWithRetry()



