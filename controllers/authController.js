const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
// const { secretKey } = require('../config');
const Farm = require('../models/farm');
const User = require('../models/user');
const sendMail = require('../utilis/sendEmail');
const sendToken = require('../utilis/sendToken');

// const login = async (req, res) =>  {
//   const { email, password } = req.body;

//   const farm = await User.findOne({ email });

//   if (!farm) {
//     return res.status(404).json({ message: 'Farm not found' });
//   }

//   const isValidPassword = await bcrypt.compare(password, farm.password);

//   if (!isValidPassword) {
//     return res.status(401).json({ message: 'Invalid password' });
//   }

//   const token = jwt.sign({ id: farm._id }, secretKey, { expiresIn: '1h' });

// //   res.json({ token });
// res.status(200).json({ 
//     success: true,
//     token: token, 
//     message: 'Login successful',
// });
// }

// const register =async(req, res)=> {
//   const { name, email, password } = req.body;

//   const existingFarm = await User.findOne({ email });

//   if (existingFarm) {
//     return res.status(400).json({ message: 'Email already exists' });
//   }

//   const hashedPassword = await bcrypt.hash(password, 10);

//   const newFarm = new User({
//     name,
//     email,
//     password: hashedPassword
//   });

//   await newFarm.save();

//   res.status(201).json({
//     success: true,
//     message: 'Account created successfully'

// });
// }

const getAllFarms = async (req, res) => {
    try {
      // Get farms specific to the authenticated user
      const farms = await User.findById(req.user.id).populate('farms', '-password');
      res.json(farms);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
  
  const createFarm = async (req, res) => {

    const user = await User.findById(req.user.id);

    const { name, email, city, country, Address } = req.body;
    const newFarm = new Farm({
      name,
      email,
      city,
      country,
      Address,
      farm:Farm._id
    });
    try {
      // Save the farm to the database
      const savedFarm = await newFarm.save();
      // Add the farm to the authenticated user's farms array
      user.farms.push({savedFarm});
      await user.save();
      res.status(201).json(savedFarm);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
  
const specificFarms = async (req, res) => {
  try {
    const farm = await Farm.findById(req.params.id);
    if (!farm) {
      return res.status(404).json({ message: 'Farm not found' });
    }
    res.status(200).json({
      success: true,
      message: 'Farm retrieved successfully',
      farm: farm
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

  const deleteFarm = async (req, res) => {
    const farmId = req.params.id;
    try {
      // Remove the farm from the authenticated user's farms array
      await User.findByIdAndUpdate(req.user.id, { $pull: { farms: farmId } });
      // Delete the farm from the farms collection
      await Farm.findByIdAndDelete(farmId);
      res.json({ message: 'Farm deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
   const register = async (req, res) => {
    try {
      const { name, email, password } = req.body;
  
      let user = await User.findOne({ email });
  
      if (user) {
        return res.status(400).json({ success: false, message: "User already exists" });
      }
  
      const otp = Math.floor(Math.random() * 1000000);
  
      user = await User.create({
        name,
        email,
        password,
        otp,
        otp_expiry: new Date(Date.now() + process.env.OTP_EXPIRE * 60 * 1000),
      });
  
      await sendMail(email, "Verify your account", `Your OTP is ${otp}`);
  
      sendToken(res, user, 201, "OTP sent to your email, please verify your account");
    } catch (error) {
      console.error(error);  // Log the actual error for debugging
      res.status(500).json({ success: false, message: "Something went wrong" });
    }
  };
  
  
 const verify = async (req, res) => {
    try {
      const otp = Number(req.body.otp);
  
      const user = await User.findById(req.user._id);
  
      if (user.otp !== otp || user?.otp_expiry < Date.now()) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid OTP or has been Expired" });
      }
  
      user.verified = true;
      user.otp = null;
      user.otp_expiry = null;
  
      await user.save();
  
      sendToken(res, user, 200, "Account Verified");
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  };
  
 const login = async (req, res) => {
    try {
      const { email, password } = req.body;
  
      if (!email || !password) {
        return res
          .status(400)
          .json({ success: false, message: "Please enter all fields" });
      }
  
      const user = await User.findOne({ email }).select("+password");
  
      if (!user) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid Email or Password" });
      }
  
      const isMatch = await user.comparePassword(password);
  
      if (!isMatch) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid Email or Password" });
      }
  
      sendToken(res, user, 200, "Login Successful");
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  };
  
 const logout = async (req, res) => {
    try {
      res
        .status(200)
        .cookie("token", null, {
          expires: new Date(Date.now()),
        })
        .json({ success: true, message: "Logged out successfully" });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  };
  
  
 const getMyProfile = async (req, res) => {
    try {
      const user = await User.findById(req.user._id);
  
      sendToken(res, user, 201, `Welcome back ${user.name}`);
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  };
  
 const updateProfile = async (req, res) => {
    try {
      const user = await User.findById(req.user._id);
  
      const { name } = req.body;
      const avatar = req.files.avatar.tempFilePath;
  
      if (name) user.name = name;
    //   if (avatar) {
    //     await cloudinary.v2.uploader.destroy(user.avatar.public_id);
  
    //     const mycloud = await cloudinary.v2.uploader.upload(avatar);
  
    //     fs.rmSync("./tmp", { recursive: true });
  
    //     user.avatar = {
    //       public_id: mycloud.public_id,
    //       url: mycloud.secure_url,
    //     };
    //   }
  
      await user.save();
  
      res
        .status(200)
        .json({ success: true, message: "Profile Updated successfully" });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  };
  
   const updatePassword = async (req, res) => {
    try {
      const user = await User.findById(req.user._id).select("+password");
  
      const { oldPassword, newPassword } = req.body;
  
      if (!oldPassword || !newPassword) {
        return res
          .status(400)
          .json({ success: false, message: "Please enter all fields" });
      }
  
      const isMatch = await user.comparePassword(oldPassword);
  
      if (!isMatch) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid Old Password" });
      }
  
      user.password = newPassword;
  
      await user.save();
  
      res
        .status(200)
        .json({ success: true, message: "Password Updated successfully" });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  };
  
   const forgetPassword = async (req, res) => {
    try {
      const { email } = req.body;
  
      const user = await User.findOne({ email });
  
      if (!user) {
        return res.status(400).json({ success: false, message: "Invalid Email" });
      }
  
      const otp = Math.floor(Math.random() * 1000000);
  
      user.resetPasswordOtp = otp;
      user.resetPasswordOtpExpiry = Date.now() + 10 * 60 * 1000;
  
      await user.save();
  
      const message = `Your OTP for resetting the password is ${otp}. If you did not request for this, please ignore this email.`;
  
      // Assuming sendMail is correctly implemented
      await sendMail(email, "Request for Resetting Password", message);
  
      res.status(200).json({ success: true, message: `OTP sent to ${email}` });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  };
  
   const resetPassword = async (req, res) => {
    try {
      const { otp, newPassword } = req.body;
  
      const user = await User.findOne({
        resetPasswordOtp: otp,
        resetPasswordOtpExpiry: { $gt: Date.now() },
      });
  
      if (!user) {
        return res
          .status(400)
          .json({ success: false, message: "Otp Invalid or has been Expired" });
      }
  
      user.password = newPassword;
      user.resetPasswordOtp = null;
      user.resetPasswordOtpExpiry = null; // Corrected property name
      await user.save();
  
      res
        .status(200)
        .json({ success: true, message: `Password Changed Successfully` });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  };
  

module.exports = { login, register, getAllFarms, createFarm, deleteFarm,specificFarms,logout, updateProfile, updatePassword, forgetPassword, resetPassword, verify };