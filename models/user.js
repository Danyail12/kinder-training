const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  farms: [{
   type:Object
  }],
  otp: Number,
  otp_expiry: Date,
  resetPasswordOtp: Number,
  resetPasswordOtpExpiry: Date,
  verified: {
    type: Boolean,
    default: false,
  }
});
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  });

  userSchema.methods.getJWTToken = function () {
    return jwt.sign({ _id: this._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000,
    });
  };
  userSchema.methods.comparePassword = async function (enteredPassword) {
    try {
      const isMatch = await bcrypt.compare(enteredPassword, this.password);
      return isMatch;
    } catch (error) {
      return false;
    }
  };
  userSchema.index({ otp_expiry: 1 }, { expireAfterSeconds: 0 });


const User = mongoose.model('User', userSchema);

module.exports = User;