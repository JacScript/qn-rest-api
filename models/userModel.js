 const {Schema, model} = require('mongoose');

const schema = new Schema (
    {
        username: {
            type : String,
            required: true
        }, 
        email: {
            type: String,
            required: true,
            unique: true
        },
        password: {
            type: String,
            require: true
        }
    }, {timestamps: true}
)


//schema timestamps indexing
schema.index({ createdAt: -1 }, { background: true });
schema.index({ updatedAt: -1 }, { background: true });

const User = model("User", schema);

module.exports = User;