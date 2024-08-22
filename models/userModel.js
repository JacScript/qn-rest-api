 const {Schema, model} = require('mongoose');
const bcrypt = require("bcrypt");



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
);


// Match user entered password to hashed password in database
schema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
  };

// Encrypt password using bcrypt
schema.pre('save', async function (next) {
    if (!this.isModified('password')) {
      next();
    }
  
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  });
  




//schema timestamps indexing
schema.index({ createdAt: -1 }, { background: true });
schema.index({ updatedAt: -1 }, { background: true });

const User = model("User", schema);

module.exports = User;