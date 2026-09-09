import User from '../models/User.js';
import MatchHistory from '../models/MatchHistory.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getProfile = asyncHandler(async (req, res) => {
  res.json({ user: req.user.toPublicJSON() });
});

export const updateLocale = asyncHandler(async (req, res) => {
  const { locale } = req.body;
  if (!['en', 'ar'].includes(locale)) {
    return res.status(400).json({ message: 'locale must be "en" or "ar"' });
  }

  const user = await User.findByIdAndUpdate(req.user._id, { locale }, { new: true });
  res.json({ user: user.toPublicJSON() });
});

export const getMyMatches = asyncHandler(async (req, res) => {
  const matches = await MatchHistory.find({ userId: req.user._id })
    .sort({ createdAt: -1 })
    .limit(10);

  res.json({ matches: matches.map((m) => m.toPublicJSON()) });
});
