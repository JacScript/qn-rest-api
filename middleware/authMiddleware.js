const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const User = require("../models/userModel.js");

const protect = asyncHandler(async (request, response, next) => {
  let token;

  token = request.cookies.jwt;

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.KEY);

      request.user = await User.findById(decoded.userId).select("-password");

      next();
    } catch (error) {
      console.error(error);
      response.status(401);
      throw new Error("Not authorized, token failed");
    }
  } else {
    response.status(401);
    throw new Error("Not authorized, no token");
  }
});

module.exports = protect;
