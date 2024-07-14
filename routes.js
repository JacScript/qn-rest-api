"use strict";

// import
// import express from "express"
const express = require("express");
const router = express.Router();
const Question = require("./models/qnModel.js");
const Answer = require("./models/ansModel.js");



// Route to get all questions (with populated answers)
router.get('/', async (request, response) => {
  try {
    const questions = await Question.find().populate('answer');
    response.json(questions);
  }catch (err) {
    response.status(500).json({ message: 'Error creating question', error: err.message });
  }
});
//POST /questions
//Route for creating questions
router.post("/", async (request, response, next) => {
  try {
    const { questionText, answer } = request.body;
    const newQuestion = new Question ({ questionText, answer});
    await newQuestion.save();
    response.status(201).json({ message: 'Question created successfully', question: newQuestion });
  } catch (err) {
    response.status(500).json({ message: 'Error creating question', error: err.message });
  }
});

//GET /questions/:qID
//Route for specific questions
router.get("/:qID", (request, response) => {
  response.json(request.question);
});

//GET /questions/:qID/answer
//Route for creating  an answer
// router.post("/:qID/answers", (request, response, next) => {
//    request.question.answers.push(request.body);
//    request.question.save((err, question) => {
//     if(err){
//       return next(err);
//     } else {
//       response.status(201);
//       response.json(question);
//     }
//    })
// });

//PUT /questions/:qID/answers/:aID
//Edit a specific answer
// router.put("/:qID/answers/:aID", (request, response) => {
//   request.answer.update(require.body, (err, result) => {
//     if(err){
//       return next(err);
//     } else {
//       response.json(result);
//     }
//   });
// });

//DELETE /questions/:qID/answers/:aID
//Delete a specific answer
// router.delete("/:qID/answers/:aID", (request, response) => {
//    request.answer.remove((err, question) => {
//      if(err){
//       return next(err);
//      } else{
//       response.json(question);
//      }
//    })

// });

//POST /questions/:qID/answers/aID/vote-up
//POST /questions/:qID/answers/aID/vote-down
//Vote for  a specific answer
// router.post("/:qID/answers/:aID/vote-:dir", function(request , response, next) {
//     if(request.params.dir.search(/^(up|down)$/) === -1) {
//         var err = new Error("Not Found");
//         err.status = 404;
//         next(err);
//     } else {
//         request.vote = request.params.dir;
//         next();
//     }
// } ,(request, response) => {
//     request.answer.vote(request.vote, (err, question) => {
//       if(err) {
//         return next(err);
//       } else {
//         response.json(question);
//       }
//     })
// })

module.exports = router;
