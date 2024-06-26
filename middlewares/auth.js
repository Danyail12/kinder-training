// import jwt from "jsonwebtoken";
// import { User } from "../models/users.js";
// import Expert from "../models/expert.js";

const jwt = require("jsonwebtoken");
const User = require("../models/user");


 const isAuthenticated = async (req, res, next) => {
  try {
    const  {token}  = req.cookies;

    if (!token) {
      return res.status(401).json({ success: false, message: "Login First" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decoded._id);

    next();
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// export const AuthotrizedExpert = async (req, res, next) => {
//   try {
//     const  {token}  = req.cookies;

//     if (!token) {
//       return res.status(401).json({ success: false, message: "Login First" });
//     }

//     const decoded = jwt.verify(token, process.env.JWT_SECRET);

//     req.user = await Expert.findById(decoded._id);

//     next();
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// }


// export const AuthorizedAdmin = (req, res, next) => {
//   if (req.user && req.user.role === "admin") {
//     next();
//   } else {
//     res.status(401).json({ success: false, message: "Unauthorized" });
//   }
// }


// export const AuthorizedSubscriber = (req, res, next) => {
//   if(req.user.subscription!=='true'&&req.user.role!=='admin'){
//     res.status(401).json({ success: false, message: "only Subscribers are allowed" });
//   }else{
//     next();
//   }

// }


// export const AuthorizedSubscriberEbook = (req, res, next) => {
//   if(req.user.subscriptionEbook!=='true'&&req.user.role!=='admin'){
//     res.status(401).json({ success: false, message: "only Subscribers are allowed" });
//   }else{
//     next();
//   }
  
// }
module.exports = isAuthenticated;
