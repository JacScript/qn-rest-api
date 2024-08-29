const { Schema, model } = require("mongoose");

const schema = new Schema(
  {
    name: {
      type: String,
      // required: true,
      unique: true,
    },
  },
  { timestamps: true }
);

const Tag = model("Tag", schema);

module.exports = Tag;
