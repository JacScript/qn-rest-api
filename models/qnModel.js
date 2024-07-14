const { Schema, model } = require('mongoose');
// const Answer = require("./ansModel.js")

const schema = new Schema({
  questionText: {
    type: String,
    required: true,
  },

  //(references the Answer model)
  answer:[{
    type: Schema.Types.ObjectId,
    ref: "Answer",
    required: true,
  }],
}, {timestamps: true});

// schema timestamps indexing
schema.index({ createdAt: -1 }, { background: true })
schema.index({ updatedAt: -1 }, { background: true })

const Question = model('Question', schema);


module.exports = Question;