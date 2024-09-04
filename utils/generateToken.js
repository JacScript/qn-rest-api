// const jwt = require("jsonwebtoken");

// const generateToken = async (response, userId) => {
//   const token = jwt.sign({ userId }, process.env.KEY, {
//     expiresIn: "30d",
//   });
//   response.cookie("jwt", token, {
//     httpOnly: true,
//     secure: process.env.NODE_ENV !== "development",
//     sameSite: 'strict',
//     maxAge: 360000,
//   });

//   return token
// };

// // export default generateToken;

// module.exports = generateToken;



const jwt = require("jsonwebtoken");

const generateToken = async (response, userId) => {
  try {
    const token = await jwt.sign({ userId }, process.env.KEY, {
      expiresIn: "30d",
    });

    response.cookie("jwt", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development",
      sameSite: 'strict',
      maxAge: 360000,
    });

    // If you want to send the token in the response body:
    return  token;
  } catch (error) {
    console.error("Error generating token:", error);
    // Handle the error appropriately, e.g., return an error response
  }
};

module.exports = generateToken;