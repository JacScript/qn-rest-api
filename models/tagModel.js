const { Schema, model } = require("mongoose");

const schema = new Schema(
  {
    name: {
      type: String,
      // required: true,
      unique: true,
    },
    followers: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },

  { timestamps: true }
);

const Tag = model("Tags", schema);

module.exports = Tag;
