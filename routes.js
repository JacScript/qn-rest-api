"use strict";

// import
var express = require("express");
var router = express.Router();

//GET /questions
//Route for question collection
router.get("/", (request, response) => {
  response.json({ response: "You sent me a GET request" });
});

//POST /questions
//Route for creating questions
router.post("/", (request, response) => {
  response.json({
    response: "You sent me a POST request",
  });
});

//GET /questions/:qID
//Route for specific questions
router.get("/:qID", (request, response) => {
  response.json({
    response: "You sent me a Get request for ID " + request.params.qID,
    body: request.body,
  });
});

//GET /questions/:qID/answer
//Route for creating  an answer
router.post("/:qID/answers", (request, response) => {
  response.json({
    response: "You sent me a POST request to /answers",
    questionId: request.params.qID,
    body: request.body,
  });
});

//PUT /questions/:qID/answers/:aID
//Edit a specific answer
router.put("/:qID/answers/:aID", (request, response) => {
  response.json({
    response: "You sent me a PUT request to /answers",
    questionId: request.params.qID,
    answerId: request.params.aID,
    body: request.body
  });
});

//DELETE /questions/:qID/answers/:aID
//Delete a specific answer
router.delete("/:qID/answers/:aID", (request, response) => {
    response.json({
        response: "You sent a DELETE request to /answer",
        questionId: request.params.qID,
        answerId: request.params.aID
    });
});

//POST /questions/:qID/answers/aID/vote-up
//POST /questions/:qID/answers/aID/vote-down
//Vote for  a specific answer
router.post("/:qID/answers/:aID/vote-:dir", function(request , response, next) { 
    if(request.params.dir.search(/^(up|down)$/) === -1) {
        var err = new Error("Not Found");
        err.status = 404;
        next(err);
    } else {
        next();
    }
} ,(request, response) => {
    response.json({
        reponse: "You sent a post request to /vote-" + request.params.dir,
        questionId: request.params.qID,
        answerId : request.params.aID,
        vote: request.params.dir
    })
})


module.exports = router;
