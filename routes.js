"use strict";

// import
// import dependences
const express = require("express");
const router = express.Router();
const { mongoose } = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
var nodemailer = require("nodemailer");
const genarateToken = require('./utils/generateToken.js')

//import files

const Question = require("./models/qnModel.js");
const Answer = require("./models/ansModel.js");
const User = require("./models/userModel.js");
const Tag = require("./models/tagModel.js")
const generateToken = require("./utils/generateToken.js");

// Route to get all questions (with populated answers)
router.get("/questions", async (request, response) => {
  try {
    const questions = await Question.find().populate("answers");
    questions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // Sort by creation time (descending)

    response.json(questions);
  } catch (err) {
    response
      .status(500)
      .json({ message: "Error creating question", error: err.message });
  }
});

//POST /questions
//Route for creating questions
router.post("/questions", async (request, response, next) => {
  try {
    const token = request.cookies;
    const { title, questionText } = request.body;
    const newQuestion = new Question({ title, questionText });
    await newQuestion.save();

    // Sort logic: Replace this with your actual sorting criteria
    const questions = await Question.find(); // Fetch existing questions
    questions.push(newQuestion); // Add new question to the array
    questions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // Sort by creation time (descending)

    console.log(token)
    // Save all questions (including the new one)
    await Promise.all(questions.map((question) => question.save()));
    response.status(201).json({
      message: "Question created and sorted successfully",
      question: newQuestion,
    }
  );
  } catch (err) {
    response
      .status(500)
      .json({ message: "Error creating question", error: err.message });
  }
});

// Route to get a specific question by ID
router.get("/questions/:id", async (request, response) => {
  try {
    const { id } = request.params;

    // Verify valid object ID format (optional, but recommended for security)
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return response.status(400).json({ message: "Invalid question ID" });
    }

    const question = await Question.findById(id);

    if (!question) {
      return response.status(404).json({ message: "Question not found" });
    }
    response
      .status(201)
      .json({ message: "Question Found", question: question });
  } catch (err) {
    response
      .status(500)
      .json({ message: "Error fetching question", error: err.message });
  }
});

//GET /questions/:qID/answer
//Route for creating  an answer
router.post("/questions/answer", async (request, response) => {
  try {
    const { qID, text } = request.body; //Etract the question Id &  the answer text from the request body

    //Verify valid object ID format(optional, but recommended for security)
    if (!mongoose.Types.ObjectId.isValid(qID)) {
      return response.status(400).json({ message: "Invalid question ID" });
    }

    const question = await Question.findById(qID);

    if (!question) {
      return response.status(404).json({ message: "Question Not Found" });
    }

    const newAnswer = new Answer({ text }); //Create new answer object
    question.answers.push(newAnswer._id); // Add answer reference to question

    await Promise.all([question.save(), newAnswer.save()]);

    const updatedQuestion = await Question.findById(qID).populate("answers"); // Populate answers

    // Sort answers by upvotes (descending) and downvotes (ascending) for a more balanced ranking
    updatedQuestion.answers.sort((a, b) => {
      if (a.votes === b.votes) {
        return b.updatedAt - a.updatedAt;
      }
    });

    response.status(201).json({
      message: "Answer created successfully",
      answer: newAnswer,
      sortedAnswers: updatedQuestion.answers,
    });
  } catch (error) {
    response
      .status(500)
      .json({ message: "Error creating answer", error: error.message });
  }
});

//PUT /questions/:qID/answers/:aID
//Edit a specific answer
router.put("/questions/answer", async (request, response) => {
  try {
    const { qID, aID, text } = request.body;

    //Verify valid object Id formats( optional but recommended for security)
    if (
      !mongoose.Types.ObjectId.isValid(qID) ||
      !mongoose.Types.ObjectId.isValid(aID)
    ) {
      return response
        .status(400)
        .json({ message: "Invalid question or answer ID Found" });
    }

    const question = await Question.findById(qID);

    if (!question) {
      return response.status(404).json({ message: "Question not Found" });
    }

    const answerIndex = question.answers.findIndex(
      (answer) => answer._id.toString() === aID
    );

    if (answerIndex === -1) {
      return response.status(404).json({ message: "Answer Not Found" });
    }

    //Update answer content(ensure allowed fields are updated)
    question.answers[answerIndex].text = text; // Update only answerText

    await question.save(); // Save updated question with modified answer

    response.status(200).json({ message: "Answer updated successfully" });
  } catch (err) {
    response
      .status(500)
      .json({ message: "Error editing answer", error: err.message });
  }
});

//DELETE /questions/answer
//Delete a specific answer
router.delete("/questions/answer", async (request, response) => {
  try {
    const { qID, aID } = request.body;

    if (
      !mongoose.Types.ObjectId.isValid(qID) ||
      !mongoose.Types.ObjectId.isValid(aID)
    ) {
      return response
        .status(400)
        .json({ message: "Invalid question or answer ID" });
    }

    const question = await Question.findById(qID);

    if (!question) {
      return response.status(404).json({ message: "Question not Found" });
    }

    const answerIndex = question.answers.findIndex(
      (answer) => answer._id.toString() === aID
    );

    if (answerIndex === -1) {
      return response.status(404).json({ message: "Answer Not Found" });
    }

    //Remove answer reference from question

    question.answers.splice(answerIndex, 1);

    await question.save(); // Save updated question with removed answer

    response.status(200).json({ message: "Answer deleted successfully" });
  } catch (err) {
    return response
      .status(500)
      .json({ message: "Error Deleting the answer", error: err.message });
  }
});

//POST /questions/:qID/answers/aID/vote-up
//POST /questions/:qID/answers/aID/vote-down
//Vote for  a specific answer
router.put("/questions/answer/vote", async (request, response) => {
  try {
    const { qID, aID, vote } = request.body;

    // Verify valid object ID formats (security)
    if (
      !mongoose.Types.ObjectId.isValid(qID) ||
      !mongoose.Types.ObjectId.isValid(aID)
    ) {
      return response
        .status(400)
        .json({ message: "Invalid question or answer Id" });
    }

    const question = await Question.findById(qID).populate("answers");

    if (!question) {
      return response.status(404).json({ message: "Question Not Found" });
    }

    const answerIndex = question.answers.find(
      (Answer) => Answer._id.toString() === aID
    );

    if (!answerIndex) {
      return response.status(404).json({ message: "Answer not found" });
    }

    // Validate vote: Ensure vote is either "up" or "down"
    if (vote !== "up" && vote !== "down") {
      return response
        .status(400)
        .json({ message: "Invalid vote type (up or down only)" });
    }

    //Update vote based on type:
    if (vote === "up") {
      answerIndex.upvotes++;
    } else {
      // vote === 'down'
      answerIndex.downvotes++;
    }

    await answerIndex.save();
    await question.save(); // Save updated question with modified answer

    // Fetch the updated question with populated answers for sorting
    const updatedQuestion = await Question.findById(qID).populate("answers");

    // Sort answers by the sum of upvotes and downvotes in descending order (most voted at the top)
    updatedQuestion.answers.sort(
      (a, b) => b.upvotes - b.downvotes - (a.upvotes - a.downvotes)
    );

    response.status(200).json({
      message: `Successfully voted ${vote} on the answer`,
      question: updatedQuestion,
    });
  } catch (err) {
    return response
      .status(500)
      .json({ message: "Error voting for answer", error: err.message });
  }
});

router.post("/auth/signup", async (request, response) => {
  const { username, email, password } = request.body;

  try {
    const user = await User.findOne({ email });

    if (user) {
      return response.json({ message: "User Already existed" });
    }

  

    const hashpassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      username,
      email,
      password: hashpassword,
    });

    await newUser.save();

    const token = jwt.sign({id: User._id }, process.env.KEY, {
      expiresIn: "30m",
    });
    // response.cookie("token", token, { httpOnly: true, maxAge: 360000 });
    return response.json({ status: true, message: "Record registed" , user: newUser , token:token});
  } catch (err) {
    return response
      .status(500)
      .json({ message: "Fail to register user", error: err.message });
  }
});

router.post("/auth/login", async (request, response) => {
  
  try {
    const { email, password } = request.body;
    const user = await User.findOne({ email });

    if (!user) {
      return response.status(404).json({ message: "User is not registered" });
    }

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return response.status(401).json({ message: "password incorrect" });
    }

    const token = jwt.sign({id: user._id }, process.env.KEY, {
      expiresIn: "30m",
    });
    response.cookie("token", token, { httpOnly: true, maxAge: 360000 });

    return response.json({ status: true, message: "Login Succesffuly", user, token: token});
  } catch (err) {
    return response
      .status("500")
      .json({ message: "Fail to Login In", error: err.message });
  }
});

router.post("/auth/forgotPassword", async (request, response) => {
  const { email } = request.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return response.status(404).json({ mesage: "User not registered" });
    }

    const token = jwt.sign({id: user._id}, process.env.KEY, {expiresIn: '5m'})

    var transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
      },
    });

    var mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: "Reset Password",
      text: `http://localhost:5173/resetPassword/${token}`,
    };

    transporter.sendMail(mailOptions, function (error) {
      if (error) {
        return response.json({ message: "error sending email" });
      } else {
        return response.json({ status: true, messsage: "Email sent" });
      }
    });
  } catch (error) {
    console.log(error);
  }
});

router.post("/auth/resetPassword/:token", async(request, response) => {
    const {token } = request.params;
    const  {password} = request.body;

    try {

      const decoded = await jwt.verify(token , process.env.KEY); 
      const id = decoded.id;
      const hashPassword = await bcrypt.hash(password, 10);
      await User.findByIdAndUpdate({_id:id}, {password: hashPassword})
      return response.json({status: true, message: "Password Updated"})
      
    } catch (err) {
      console.error(err);
      return response.json({message: "Invalid token"})
    }

});


// Function to verify the token (replace with your secret key)
// const verifyToken = (req, res, next) => {
//   const token = req.headers['authorization'];
//   if (!token) {
//     return res.status(401).json({ message: 'Unauthorized access' });
//   }
//   jwt.verify(token, 'your_secret_key', (err, decoded) => {
//     if (err) {
//       return res.status(403).json({ message: 'Forbidden (invalid token)' });
//     }
//     req.decoded = decoded;
//     next();
//   });
// };



router.get("/profile/", async(request, response) => {
  try {
    // Get token from cookie
    // const token = request.params.token;
    const token = request.cookies.token;

    // Check if token exists
    if (!token) {
      return response.status(401).json({ message: 'Unauthorized: Missing access token' });
    }

    // Verify the token using JWT secret (replace with your secret)
    const decoded = jwt.verify(token, process.env.KEY);

    // Get the user ID from the decoded token
    const id = require.decoded.id;

    // Find the user by ID in MongoDB
    const user = await User.findById(id);

    // Check if user exists 
    if (!user) {
      return response.status(404).json({ message: 'User not found' });
    }

    // Return the username
    return response.status(200).json({user: user.username});
  } catch (err) {
    console.error(err);
   return response.status(500).json({ message: 'Internal server error' });
  }
});



router.post("/tags", async (request, response) => {
  try {
    const { name } = request.body;

    const tag = new Tag({ name });
    const savedTag = await tag.save();
    response.status(201).json({ message: savedTag });
  } catch (error) {
    console.log(error);
    response.status(500).json({ message: error.message });
  }
});

router.get('/tags', async (request, response) => {
  try {
    const tags = await Tag.find();
    response.json(tags);
  } catch (error) {
    console.error(error);
    response.status(500).json({ error: 'Error fetching tags' });
  }
});


module.exports = router;
