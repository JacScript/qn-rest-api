"use strict";

// import
// import dependences
const express = require("express");
const router = express.Router();
const { mongoose } = require("mongoose");
// const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
var nodemailer = require("nodemailer");

const asyncHandler = require("express-async-handler");

//import files

const Question = require("./models/qnModel.js");
const Answer = require("./models/ansModel.js");
const User = require("./models/userModel.js");
const Tags = require("./models/tagModel.js")
const Comment = require("./models/commentModel.js")
const generateToken = require("./utils/generateToken.js");
const protect = require("./middleware/authMiddleware.js");

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
//Route for creating question
router.post("/question", async (request, response, next) => {
  try {
    // const token = request.cookies;
    const { title, questionText, tags , user} = request.body;

    //get user id
    // const userId = User._id
    const newQuestion = new Question({ title, questionText, tags, user});
    await newQuestion.save();

    // Sort logic: Replace this with your actual sorting criteria
    const questions = await Question.find(); // Fetch existing questions
    questions.push(newQuestion); // Add new question to the array
    questions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // Sort by creation time (descending)

      // Save all questions (including the new one)
    await Promise.all(questions.map((question) => question.save()));
    response.status(201).json({
      message: "Question created and sorted successfully",
      question: newQuestion      
    });
  } catch (err) {
    response
      .status(500)
      .json({ message: "Error creating question", error: err.message });
  }
});

// Route to get a specific question by ID
router.get("/question/:id", async (request, response) => {
  try {
    const { id } = request.params;

    // Verify valid object ID format (optional, but recommended for security)
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return response.status(400).json({ message: "Invalid question ID" });
    }

    const question = await Question.findById(id).populate('user', 'email');
   

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
    const { qID, text, user } = request.body; //Etract the question Id &  the answer text from the request body

    //Verify valid object ID format(optional, but recommended for security)
    if (!mongoose.Types.ObjectId.isValid(qID)) {
      return response.status(400).json({ message: "Invalid question ID" });
    }

    const question = await Question.findById(qID);

    if (!question) {
      return response.status(404).json({ message: "Question Not Found" });
    }

    const newAnswer = new Answer({ text, user }); //Create new answer object
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


// Route to get all answers of a specific question
router.get('/questions/:qID/answers', async (request, response) => {

    try {

  const { qID } = request.params;

        // Check if the question exists
        
        //Verify valid object ID format(optional, but recommended for security)
    if (!mongoose.Types.ObjectId.isValid(qID)) {
      return response.status(400).json({ message: "Invalid question ID" });
    }

    const question = await Question.findById(qID).populate("answers");

        if (!question) {
            return response.status(404).json({ message: 'Question not found' });
        }

        // Find all answers related to the specific question
        // const answers = await Answer.findById(qID).populate("answers")

       const answer = question.answers;
        // Send the answers as a response
        response.status(200).json({answer});
    } catch (err) {
        console.error(err);
        response.status(500).json({ message: 'Server error' });
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

    if (
      !mongoose.Types.ObjectId.isValid(qID) ||
      !mongoose.Types.ObjectId.isValid(aID)
    ) {
      return response
        .status(400)
        .json({ message: "Invalid question or answer ID" });
    }

    const answer = await Answer.findById(aID);

    if (!answer) {
      return response.status(404).json({ message: "Answer Not Found" });
    }


    //Update vote based on type:
    if (vote === "up") {
      answer.votes++;
    } else if(vote === "down") {
      // vote === 'down'
      // answer.votes--;
      answer.votes = Math.max(answer.votes - 1, 0);
    }

    await answer.save(); // Save updated question with modified answer

    // Fetch the updated question with populated answers for sorting
    const updatedAnswer = await Answer.findById(aID);

    // Fetch the updated question with populated answers for sorting
    // const updatedQuestion = await Question.findById(qID).populate("answers");

    // Sort answers by the sum of upvotes and downvotes in descending order (most voted at the top)
    // updatedQuestion.answers.sort(
    //   (a, b) => b.upvotes - b.downvotes - (a.upvotes - a.downvotes)
    // );

    response.status(200).json({
      message: `Successfully voted ${vote} on the answer`,
      answer: updatedAnswer,
      // updatedQuestion: updatedQuestion.answers,
    });
  } catch (err) {
    return response
      .status(500)
      .json({ message: "Error voting for answer", error: err.message });
  }
});


//Get /question/comment
//Get comments for a specific answer
router.get("/question/:qID/comments", async (request, response) => { 
  try {
    const { qID } = request.params; 


    if (
      !mongoose.Types.ObjectId.isValid(qID)) {
      return response
        .status(400)
        .json({ message: "Invalid question Id" });
    }


      // // Find the question based on qID
      const question = await Question.findById(qID)
      .populate({
        path: "comments",
        populate: { path: "user", select: "email" },
      });


      if (!question) {
          return response.status(404).json({ error: 'Question not found' });
      }

      const comments = question.comments;

      response.status(200).json({comments})
  } catch (error) {
      console.error(error);
      response.status(500).json({ error: 'Internal server error' });
  }
});

// router.get("/question/:qID/comments", async (request, response) => {
//   const { qID} = request.params;
//   const {memo} = request.query; // Use req.query for GET parameters

//   try {
//     if (!mongoose.Types.ObjectId.isValid(qID)) {
//       return response
//         .status(400)
//         .json({ message: "Invalid question Id..." });
//     }

//     // Find comments for the question, optionally filtering by text
//     let comments = await Comment.find({ question: qID })
//       .populate('user', 'name email') // Populate user information if needed
//       .sort({ createdAt: -1 }); // Sort comments by creation time descending

//     if (memo) {
//       comments = comments.filter(comment => comment.memo.toLowerCase().includes(memo.toLowerCase()));
//     }

//     response.status(200).json({ comments });
//   } catch (error) {
//     console.error(error);
//     response.status(500).json({ error: 'Internal server error' });
//   }
// });


router.post("/comment", async (request, response) => {
  // Extract question ID and comment memo from request body

  try {

  const { qID, memo , userId} = request.body;

    // Validate question ID format
    if (!mongoose.Types.ObjectId.isValid(qID)) {
      return response
        .status(400) // Bad request
        .json({ message: "Invalid question Id" });
    }

    // Find the question by its ID
    const question = await Question.findById(qID);

    // Check if question exists
    if (!question) {
      return response.status(404).json({ message: "Question Not Found" });
    }

    // Create a new comment object
    const newComment = new Comment({ memo, user: userId }); // Associate comment with question
    
    // Add the comment reference to the question's comments array
     question.comments.push(newComment._id);

    // Save the new comment
    await Promise.all([question.save(), newComment.save()]);


    // Save both the question (with updated comments) and the new comment
    // await question.save();

    // Fetch the updated question with populated comments
    const updatedQuestion = await Question.findById(qID).populate("comments");

    // Sort comments based on votes and updated date for a balanced ranking
    updatedQuestion.comments.sort((a, b) => {
      if (a.votes === b.votes) {
        return b.updatedAt - a.updatedAt; // Sort by descending update date if votes are equal
      }
      return b.votes - a.votes; // Sort by descending votes
    });

    // Send successful response with new comment, sorted comments, and message
    response.status(201).json({
      message: "Comment created successfully",
      comments: newComment,
      sortedComments: updatedQuestion.comments,
    });
  } catch (error) {
    console.error(error);
    response.status(500).json({ error: "Internal server error" });
  }
});

//POST /questions/:qID/vote
//POST /questions/:qID/vote
//Vote for  a specific question
router.put("/comments/vote", async (request, response) => {
  try {
    const { commentID, vote } = request.body;

    // Verify valid object ID formats (security)
    if (!mongoose.Types.ObjectId.isValid(commentID)) {
      return response.status(400).json({ message: "Invalid question Id" });
    }

    const comment = await Comment.findById(commentID);

    if (!comment) {
      return response.status(404).json({ message: "Question Not Found" });
    }

    // Validate vote: Ensure vote is either "up" or "down"
    if (vote !== "up") {
      return response
        .status(400)
        .json({ message: "Invalid vote type (up or down only)" });
    }

    //Update vote based on type:
    if (vote === "up") {
      comment.votes++;
    } 



    await comment.save(); // Save updated question with modified answer

    // Fetch the updated question with populated answers for sorting
    const updatedComment = await Comment.findById(commentID);

    response.status(200).json({
      message: `Successfully voted ${vote} on the answer`,
      comment: updatedComment,
    });
  } catch (err) {
    return response
      .status(500)
      .json({ message: "Error voting for answer", error: err.message });
  }
});

//POST /questions/:qID/vote
//POST /questions/:qID/vote
//Vote for  a specific question
router.put("/question/vote", async (request, response) => {
  try {
    const { qID, vote } = request.body;

    // Verify valid object ID formats (security)
    if (!mongoose.Types.ObjectId.isValid(qID)) {
      return response.status(400).json({ message: "Invalid question Id" });
    }

    const question = await Question.findById(qID);

    if (!question) {
      return response.status(404).json({ message: "Question Not Found" });
    }

    // Validate vote: Ensure vote is either "up" or "down"
    // if (vote !== "up" && vote !== "down" ) {
    //   return response
    //     .status(400)
    //     .json({ message: "Invalid vote type (up or down only)" });
    // }

    //Update vote based on type:
    if (vote === "up") {
      question.votes++;
    } else {
      // vote === 'down'
      // question.votes--;
      question.votes = Math.max(question.votes - 1, 0);
    }

    await question.save(); // Save updated question with modified answer

    // Fetch the updated question with populated answers for sorting
    const updatedQuestion = await Question.findById(qID);

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








// @desc    Auth user/set token
//route     /auth/login
//@access   Public
router.post(
  "/auth/login",
  asyncHandler(async (request, response) => {
    const { email, password } = request.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
     const token = await generateToken(response, user._id);
      response.status(200).json({
        id: user._id,
        username: user.username,
        email: user.email,
        token: token
      });
    } else {
      response.status(401);
      throw new Error("Invalid email or password");
    }
  })
);

// @desc    Register a new user
//route     /auth/signup
//@access   Public
router.post(
  "/auth/signup",
  asyncHandler(async (request, response) => {
    const { username, email, password } = request.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
      response.status(400);
      throw new Error("User already exists");
    }

    // const hashpassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      username,
      email,
      password,
    });

    if (user) {
      const token = await generateToken(response, user._id);
      response.status(201).json({
        id: user._id,
        username: user.username,
        email: user.email,
        token
      });
    } else {
      response.status(400);
      throw new Error("Invalid user data");
    }
  })
);

// @desc    Logout user
//route     /auth/logout
//@access   Public
router.post(
  "/auth/logout",
  asyncHandler(async (request, response) => {
    response.cookie("jwt", "", {
      httpOnly: true,
      expires: new Date(0),
    });

    response.status(200).json({ message: "User logged Out" });
  })
);

// @desc    getUser Profile
//route     /auth/profile
//@access   Private
router.get(
  "/auth/profile",
  protect,
  asyncHandler(async (request, response) => {
    const user = {
      _id: request.user._id,
      username: request.user.username,
      email: request.user.email,
    };
    response.status(200).json(user);
  })
);

// @desc    Update user profile
//route     /auth/profile
//@access   private
router.put(
  "/auth/profile",
  protect,
  asyncHandler(async (request, response) => {
    const user = await User.findById(request.user._id);

    if (user) {
      user.username = request.body.username || user.username;
      user.email = request.body.email || user.email;

      if (request.body.password) {
        user.password = request.body.password;
      }

      const updatedUser = await user.save();

      response.status(200).json({
        _id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
      });
    } else {
      response.status(404);
      throw new Error("User not found");
    }
  })
);

// router.post("/auth/forgotPassword", async (request, response) => {
//   const { email } = request.body;

//   try {
//     const user = await User.findOne({ email });

//     if (!user) {
//       return response.status(404).json({ mesage: "User not registered" });
//     }

//     const token = jwt.sign({ id: user._id }, process.env.KEY, {
//       expiresIn: "5m",
//     });

//     var transporter = nodemailer.createTransport({
//       service: "gmail",
//       auth: {
//         user: process.env.EMAIL,
//         pass: process.env.PASSWORD,
//       },
//     });

//     var mailOptions = {
//       from: process.env.EMAIL,
//       to: email,
//       subject: "Reset Password",
//       text: `http://localhost:5173/resetPassword/${token}`,
//     };

//     transporter.sendMail(mailOptions, function (error) {
//       if (error) {
//         return response.json({ message: "error sending email" });
//       } else {
//         return response.json({ status: true, messsage: "Email sent" });
//       }
//     });
//   } catch (error) {
//     console.log(error);
//   }
// });

// router.post("/auth/resetPassword/:token", async (request, response) => {
//   const { token } = request.params;
//   const { password } = request.body;

//   try {
//     const decoded = await jwt.verify(token, process.env.KEY);
//     const id = decoded.id;
//     const hashPassword = await bcrypt.hash(password, 10);
//     await User.findByIdAndUpdate({ _id: id }, { password: hashPassword });
//     return response.json({ status: true, message: "Password Updated" });
//   } catch (err) {
//     console.error(err);
//     return response.json({ message: "Invalid token" });
//   }
// });

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

module.exports = router;
