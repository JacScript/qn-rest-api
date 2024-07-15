const { Schema, model } = require("mongoose");

const schema = new Schema(
  {
    text: {
      type: String,
      required: true,
    },
    upvotes: {
      type: Number, 
      default: 0 
    },
    downvotes: {
      type: Number,
      default: 0},
  },
  { timestamps: true }
);

//schema timestamps indexing
schema.index({ createdAt: -1 }, { background: true });
schema.index({ updatedAt: -1 }, { background: true });

const Answer = model("Answer", schema);

module.exports = Answer;
