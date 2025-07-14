const jwt = require('jsonwebtoken');
const User = require('../models/User');
const otpGenerator = require('otp-generator');
const sendEmail = require('../utils/sendEmail');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

exports.registerUser = async (req, res) => {
  try {
    const { first_name, last_name, email, password } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    const user = await User.create({ first_name, last_name, email, password });
    res.status(201).json({
      _id: user._id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const otp = otpGenerator.generate(6, { digits: true, alphabets: false });
    user.otp = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000; // expires in 10 minutes
    await user.save();

    await sendEmail(email, 'Your OTP for FocusNest Login', `Your OTP is: ${otp}`);
    res.json({ message: 'OTP sent to your email. Please verify to complete login.' });

    // res.json({
    //   _id: user._id,
    //   username: user.username,
    //   email: user.email,
    //   token: generateToken(user._id),
    // });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.verifyOtp = async (req, res) => {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });
  
    if (!user || user.otp !== otp || Date.now() > user.otpExpires) {
      return res.status(401).json({ message: 'Invalid or expired OTP' });
    }
  
    // Clear OTP after use
    user.otp = null;
    user.otpExpires = null;
    await user.save();
  
    const token = generateToken(user._id);
    res.json({
      _id: user._id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      token
    });
    
  };



  exports.resendOtp = async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });
  
    const otp = otpGenerator.generate(6, { digits: true, alphabets: false });
    user.otp = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000;
    await user.save();
  
    await sendEmail(email, 'Your OTP for FocusNest Login (Resent)', `Your OTP is: ${otp}`);
    res.json({ message: 'OTP resent to your email' });
  };
  
  
