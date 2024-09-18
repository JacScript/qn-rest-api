const jwt = require("jsonwebtoken");

const generateToken = (response, userId) => {
  const token = jwt.sign({ userId }, process.env.KEY, {
    expiresIn: "30d",
  });
  response.cookie('jwt', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV !== "development",
    sameSite: 'strict',
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days in milliseconds
   // maxAge: 360000,
  });

  // return token
};

module.exports = generateToken;




// const jwt = require('jsonwebtoken'); // Ensure you have the jwt library included

// const generateToken = async (response, userId) => {
//   try {
//     // Generate the token using userId and a secret key
//     const token = await jwt.sign({ userId }, process.env.KEY, {
//       expiresIn: "30d", // Token expiration set to 30 days
//     });

//     // Set the cookie with the token
//     await response.cookie("jwt", token, {
//       httpOnly: true, // Ensures the cookie is only accessible via HTTP(S) requests, not JavaScript
//        secure: process.env.NODE_ENV !== "development", // Only send over HTTPS in production
//       sameSite: 'strict', // Protect against CSRF attacks
//       maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days in milliseconds
//       path: '/', // Cookie will be available throughout the whole site
//     });

//     // Optionally return the token in the response body
//     return token;
//   } catch (error) {
//     console.error("Error generating token:", error);
//     throw new Error('Error generating token');
//   }
// };

// module.exports = generateToken;


