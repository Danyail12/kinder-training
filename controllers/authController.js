const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { secretKey } = require('../config');
const Farm = require('../models/farm');
const User = require('../models/user');

const login = async (req, res) =>  {
  const { email, password } = req.body;

  const farm = await User.findOne({ email });

  if (!farm) {
    return res.status(404).json({ message: 'Farm not found' });
  }

  const isValidPassword = await bcrypt.compare(password, farm.password);

  if (!isValidPassword) {
    return res.status(401).json({ message: 'Invalid password' });
  }

  const token = jwt.sign({ id: farm._id }, secretKey, { expiresIn: '1h' });

//   res.json({ token });
res.status(200).json({ 
    success: true,
    token: token, 
    message: 'Login successful',
});
}

const register =async(req, res)=> {
  const { name, email, password } = req.body;

  const existingFarm = await User.findOne({ email });

  if (existingFarm) {
    return res.status(400).json({ message: 'Email already exists' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newFarm = new User({
    name,
    email,
    password: hashedPassword
  });

  await newFarm.save();

  res.status(201).json({
    success: true,
    message: 'Account created successfully'

});
}

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

module.exports = { login, register, getAllFarms, createFarm, deleteFarm,specificFarms };