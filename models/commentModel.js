const { Schema, model } = require("mongoose");

const schema = new Schema({
  memo: {
    type: String,
    required: true,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    // required: true,
  },
  // ... other fields
}, { timestamps: true });

// schema timestamps indexing
schema.index({ createdAt: -1 }, { background: true });
schema.index({ updatedAt: -1 }, { background: true });

const Comment = model("Comment", schema);

module.exports = Comment;
