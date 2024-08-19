const jwt = require("jsonwebtoken");

const generateToken = async (response, userId) => {
  const token =  await jwt.sign({ userId }, process.env.KEY, {
    expiresIn: "30d",
  });
 await  response.cookie("jwt", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV !== "development",
    sameSite: 'strict',
    maxAge: 360000,
  });
};

module.exports = generateToken;
