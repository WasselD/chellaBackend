import User from '../models/User.js';
import { signToken } from '../utils/jwt.js';
import { addCoins } from '../services/coinService.js';
import { generateReferralCode, applyReferral } from '../services/referralService.js';
import { env } from '../config/env.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const register = asyncHandler(async (req, res) => {
  const { username, email, password, referralCode } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: 'username, email and password are required' });
  }
  if (password.length < 8) {
    return res.status(400).json({ message: 'Password must be at least 8 characters' });
  }

  const existing = await User.findOne({ $or: [{ email: email.toLowerCase() }, { username }] });
  if (existing) {
    return res.status(409).json({ message: 'That email or username is already taken' });
  }

  let code = generateReferralCode();
  while (await User.exists({ referralCode: code })) code = generateReferralCode();

  const user = new User({ username, email: email.toLowerCase(), referralCode: code });
  await user.setPassword(password);
  await user.save();

  await addCoins(user._id, env.economy.starterCoins, 'signup_bonus');
  if (referralCode) await applyReferral(user, referralCode);

  const freshUser = await User.findById(user._id);
  const token = signToken(freshUser._id.toString());

  res.status(201).json({ token, user: freshUser.toPublicJSON() });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'email and password are required' });
  }

  const user = await User.findOne({ email: email.toLowerCase() });
  const valid = user && (await user.comparePassword(password));

  if (!valid) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  const token = signToken(user._id.toString());
  res.json({ token, user: user.toPublicJSON() });
});

export const me = asyncHandler(async (req, res) => {
  res.json({ user: req.user.toPublicJSON() });
});
