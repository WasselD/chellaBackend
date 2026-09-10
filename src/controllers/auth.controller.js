import User from '../models/User.js';
import { signToken } from '../utils/jwt.js';
import { addCoins } from '../services/coinService.js';
import { generateReferralCode, applyReferral } from '../services/referralService.js';
import { env } from '../config/env.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { isNonEmptyString, isValidEmail, isValidUsername, passwordStrength } from '../utils/validators.js';

export const register = asyncHandler(async (req, res) => {
  const { username, email, password, referralCode } = req.body;

  // Every field is checked to actually BE a string before it's used in
  // any query — Mongoose would otherwise treat an object payload like
  // { "$gt": "" } as a query operator instead of a value.
  if (!isValidUsername(username)) {
    return res.status(400).json({ message: 'Username must be 3-20 characters (letters, numbers, _ . -)' });
  }
  if (!isValidEmail(email)) {
    return res.status(400).json({ message: 'Enter a valid email address' });
  }
  const { isStrong } = passwordStrength(password);
  if (!isStrong) {
    return res.status(400).json({
      message: 'Password must be at least 8 characters and include 3 of: lowercase, uppercase, number, symbol'
    });
  }
  if (referralCode !== undefined && !isNonEmptyString(referralCode, { max: 20 })) {
    return res.status(400).json({ message: 'Invalid referral code' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const trimmedUsername = username.trim();

  const existing = await User.findOne({ $or: [{ email: normalizedEmail }, { username: trimmedUsername }] });
  if (existing) {
    return res.status(409).json({ message: 'That email or username is already taken' });
  }

  let code = generateReferralCode();
  while (await User.exists({ referralCode: code })) code = generateReferralCode();

  const user = new User({ username: trimmedUsername, email: normalizedEmail, referralCode: code });
  await user.setPassword(password);
  await user.save();

  await addCoins(user._id, env.economy.starterCoins, 'signup_bonus');
  if (referralCode) await applyReferral(user, referralCode.trim());

  const freshUser = await User.findById(user._id);
  const token = signToken(freshUser._id.toString());

  res.status(201).json({ token, user: freshUser.toPublicJSON() });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!isNonEmptyString(email) || !isNonEmptyString(password)) {
    return res.status(400).json({ message: 'email and password are required' });
  }

  const user = await User.findOne({ email: email.trim().toLowerCase() });
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
