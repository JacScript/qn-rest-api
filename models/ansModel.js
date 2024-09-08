const { Schema, model } = require("mongoose");

const schema = new Schema(
  {
    text: {
      type: String,
      required: true,
          },
    votes: {
      type: Number,
      default: 0,
          },
    //reference the user model
    user: {
      ref: "User",
      type: Schema.Types.ObjectId,
      // required: true,
      // autopopulate: { maxDepth: 1 },
    },
  },
  { timestamps: true }
);

//schema timestamps indexing
schema.index({ createdAt: -1 }, { background: true });
schema.index({ updatedAt: -1 }, { background: true });

const Answer = model("Answer", schema);

module.exports = Answer;
