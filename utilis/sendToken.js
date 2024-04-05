
// import cookieParser from "cookie-parser";
// import jwt from "jsonwebtoken";
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");


 const sendToken = (res, user, statusCode, message) => {
    const token = user.getJWTToken();
  
    const options = {
      httpOnly: true,
      expires: new Date(
        Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
      ),
    };
  
    const userData = {
      _id: user._id,
      email: user.email,
      farms: user.farms,
      token:token ,
      userId: user._id.toString(),
      otp:user.otp,

    };
  
    res
      .status(statusCode)
      .cookie("token", token, options)
      .json({ success: true, message, user: userData });
  };
  
  module.exports = sendToken