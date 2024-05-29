const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  companyName: {
    type: String,
    required: true,
  },
  companyAddress: {
    type: String,
    required: true,
  },
  companyWebsite: {
    type: String,
  },
  username: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: /^[\w-]+(?:\.[\w-]+)*@(?:[\w-]+\.)+[a-zA-Z]{2,7}$/,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  resetCode: {
    type: Number,
    default: null,
  },
  resetCodeExpiration: {
    type: Date,
    default: null,
  },
  logo: {
    type: String,
  },
});

module.exports = mongoose.model("User", userSchema);
