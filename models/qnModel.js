const { Schema, model } = require("mongoose");

const schema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },

    questionText: {
      type: String,
      required: true,
    },

    tags: [
      {
        type: String,
      },
    ],

    //reference the user model
    user: {
      ref: "User",
      required: true,
      type: Schema.Types.ObjectId,
      autopopulate: { maxDepth: 1 }
    },

    //(references the Answer model)
    answers: [
      {
        type: Schema.Types.ObjectId,
        ref: "Answer",
        required: true,
      },
    ],
  },
  { timestamps: true }
);

// schema timestamps indexing
schema.index({ createdAt: -1 }, { background: true });
schema.index({ updatedAt: -1 }, { background: true });

const Question = model("Question", schema);

module.exports = Question;
