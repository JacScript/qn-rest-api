const jwt = require("jsonwebtoken");


const generateToken = (id) => {
    return jwt.sign({id}, process.env.KEY, {
        expiresIn: "30m"
    });
    response.cookie("token", token, { httpOnly: true, maxAge: 360000 });

};

module.exports = generateToken