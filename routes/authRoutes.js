const express = require('express');
// import express from 'express';
const isAuthenticated = require('../middlewares/auth');
const { login, register,verify, forgetPassword, resetPassword, updateProfile, updatePassword, logout } = require('../controllers/authController');
const { getAllFarms, createFarm, deleteFarm ,specificFarms} = require('../controllers/authController');
const auth = require('../middlewares/auth');
const router = express.Router();

router.post('/login', login);
router.post('/forgetPassword', forgetPassword);
router.get('/verify', verify);
router.post('/resetPassword', resetPassword);
router.post('/updateProfile',isAuthenticated, updateProfile);
router.post('/updatePassword',isAuthenticated, updatePassword);
router.get('/logout',isAuthenticated, logout);
router.post('/register', register);
router.get('/farms',isAuthenticated, getAllFarms);
router.post('/create',isAuthenticated, createFarm);
router.delete('/:id',isAuthenticated, deleteFarm);
router.get('/specificFarm/:id',isAuthenticated, specificFarms);


module.exports = router;
