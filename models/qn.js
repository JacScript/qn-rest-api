"use strict";

const { Schema, model, mongoose } = require("mongoose");

const QuestionSchema = new Schema(
  {
    text: { index: true, require: true, type: String },
    answer: {
        ref: "Answer",
        type: Schema.Types.ObjectId,
    }
  },
  { timestamps: true }
);

// schema timestamps indexing
QuestionSchema.index({ createdAt: -1 }, { background: true })
// Schema.index({ updatedAt: -1 }, { background: true })

QuestionSchema.pre("save", (next) => {
    this.answer.sort();
    next()
})

// question model
const Question = mongoose.model("Question", QuestionSchema)

// exporting product model
module.exports = Question
