const { Schema, model } = require('mongoose');

const schema = new Schema({
  text: {
    type: String,
    required: true,
  }
}, {timestamps: true});

const Answer = model('Answer', schema);

module.exports = Answer;