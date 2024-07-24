 "use strict"

// //imports
const express = require("express");
const  application = express();
const routes = require("./routes");
const dotenv = require("dotenv")
const mongoose = require("mongoose");
const cors = require('cors')
const cookieParser = require('cookie-parser');






var jsonParser = require("body-parser").json  //has multiple parse to manage http request
var logger = require("morgan");



const port = process.env.PORT;
const MONGOURL = process.env.MONGO_URL;

application.use(express.json());
application.use(cors(
    {
        origin: ['http://localhost:5173'],
        credentials: true
    }
))
application.use(cookieParser())
dotenv.config();

//handling routes
application.use("/", routes);


//catch 404 and forward to error handleer
application.use((request, response, next) => {
   var err = new Error(`Not Found - ${request.originalUrl}`);
   err.status = 404;
   next(err);
});

//Error Handler
application.use((error, request, response, next) => {
     const statusCode = response.statusCode  === 200 ?  500 : response.statusCode; 
    response.status(statusCode);
    response.json({
            message: error.message,
            stack :  process.env.NODE_ENV === "production" ? null : error.stack,
    })
});


 

async function connectWithRetry() {
    try{

        //connecting to mongo db database
        const databaseConnected = await mongoose.connect(process.env.MONGO_URL);


        //verifying the database is connected
        if(databaseConnected){
            application.listen(process.env.PORT, () => {
                console.log(`database has been connected and server is running on port ${process.env.PORT}`)
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



