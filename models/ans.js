'use strict'

const { Schema, model, mongoose} = require("mongoose");

const AnswerSchema =  new Schema(
    {
        text: {index: true, require: true, type: String},
        votes: {type: Number, default: 0}
    },{timestamps: true}
)

AnswerSchema.index({ createdAt: -1 }, { background: true })
AnswerSchema.index({ updatedAt: -1 }, { background: true })

const Answer = mongoose.model("Answer",AnswerSchema )

module.exports = Answer



