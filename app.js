"use strict";

// // Imports
// const express = require("express");
// const application = express();
// const routes = require("./routes");
// const dotenv = require("dotenv");
// const mongoose = require("mongoose");
// const cookieParser = require("cookie-parser");
// const cors = require("cors");
// const { notFound, errorHandler } = require("./middleware/errorMiddleware.js");

// dotenv.config();
// application.use(express.json());
// application.use(express.urlencoded({ extended: true }));
// application.use(cookieParser());

// // CORS configuration
// application.use(
//   cors({
//     origin: ["http://localhost:3000"], // Change to your frontend's port
//     credentials: true,
//   })
// );

// // Handling routes
// application.use("/", routes);

// // Error handling
// application.use(notFound);
// application.use(errorHandler);

// // MongoDB connection with retry
// async function connectWithRetry() {
//   try {
//     // Connect to MongoDB
//     const databaseConnected = await mongoose.connect(process.env.MONGO_URL, {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//     });

//     // Verify database connection and start server
//     if (databaseConnected) {
//       const port = process.env.PORT || 5080;
//       application.listen(port, () => {
//         console.log(`Database connected, server running on port ${port}`);
//       });
//     } else {
//       console.log("Database connection failed, retrying in 5 seconds...");
//       setTimeout(connectWithRetry, 5000);
//     }
//   } catch (error) {
//     console.error(`Database connection error: ${error}`);
//     setTimeout(connectWithRetry, 5000);
//   }
// }

// connectWithRetry();
















































































































// "use strict";

// //imports
const express = require("express");
const application = express();
const routes = require("./routes");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
dotenv.config();


application.use(express.json());
application.use(express.urlencoded({ extended: true }));
application.use(cookieParser());


const cors = require("cors");

var jsonParser = require("body-parser").json; //has multiple parse to manage http request
var logger = require("morgan");

const { notFound, errorHandler } = require("./middleware/errorMiddleware.js");

const port = process.env.PORT || 5000;
const MONGOURL = process.env.MONGO_URL;

application.use(
  cors({
    origin: ["http://localhost:5000"],
    credentials: true,
  })
);


//handling routes
application.use("/", routes);

application.use(notFound);
application.use(errorHandler);

//catch 404 and forward to error handleer
// application.use((request, response, next) => {
//    var err = new Error(`Not Found - ${request.originalUrl}`);
//    err.status = 404;
//    next(err);
// });

//Error Handler
// application.use((error, request, response, next) => {
//      const statusCode = response.statusCode  === 200 ?  500 : response.statusCode;
//     response.status(statusCode);
//     response.json({
//             message: error.message,
//             stack :  process.env.NODE_ENV === "production" ? null : error.stack,
//     })
// });

async function connectWithRetry() {
  try {
    //connecting to mongo db database
    const databaseConnected = await mongoose.connect(MONGOURL);

    //verifying the database is connected
    if (databaseConnected) {
      application.listen(port, () => {
        console.log(
          `database has been connected and server is running on port ${process.env.PORT}`
        );
      });
    } else {
      console.log("Database connection  failed");
      setInterval(connectWithRetry, 5000);
    }
  } catch (error) {
    console.log(`Database connection error: ${error}`);
    setInterval(connectWithRetry, 5000);
  }
}

connectWithRetry();
