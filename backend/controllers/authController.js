import jwt from 'jsonwebtoken';
import otpGenerator from 'otp-generator';
import User from '../models/User.js';
import sendEmail from '../utils/sendEmail.js';

// 🔐 Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// 🧑‍💻 Register a new user
export const registerUser = async (req, res) => {
  try {
    const { first_name, last_name, email, password } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists)
      return res.status(400).json({ message: 'User already exists' });

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

// 🔐 Login user and send OTP
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const otp = otpGenerator.generate(6, { digits: true, alphabets: false });
    user.otp = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    await sendEmail(
      email,
      'Your OTP for FocusNest Login',
      `Your OTP is: ${otp}`
    );

    res.json({
      message: 'OTP sent to your email. Please verify to complete login.',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Verify OTP and complete login
export const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;
  const user = await User.findOne({ email });

  if (!user || user.otp !== otp || Date.now() > user.otpExpires) {
    return res.status(401).json({ message: 'Invalid or expired OTP' });
  }

  user.otp = null;
  user.otpExpires = null;
  await user.save();

  const token = generateToken(user._id);
  res.json({
    _id: user._id,
    first_name: user.first_name,
    last_name: user.last_name,
    email: user.email,
    token,
  });
};

// 🔁 Resend OTP
export const resendOtp = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) return res.status(404).json({ message: 'User not found' });

  const otp = otpGenerator.generate(6, { digits: true, alphabets: false });
  user.otp = otp;
  user.otpExpires = Date.now() + 10 * 60 * 1000;
  await user.save();

  await sendEmail(
    email,
    'Your OTP for FocusNest Login (Resent)',
    `Your OTP is: ${otp}`
  );

  res.json({ message: 'OTP resent to your email' });
};

// ⚙️ Update user focus preferences
export const updateFocusPreferences = async (req, res) => {
  const { focusPeaks } = req.body;

  if (!Array.isArray(focusPeaks) || focusPeaks.length === 0) {
    return res
      .status(400)
      .json({ message: 'Focus peaks must be a non-empty array' });
  }

  try {
    const user = await User.findById(req.user._id);
    user.focusPeaks = focusPeaks;
    await user.save();

    res.json({
      message: 'Focus peaks updated successfully',
      focusPeaks: user.focusPeaks,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// 👤 Get current logged-in user
export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
