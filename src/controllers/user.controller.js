import User from '../models/User.js';
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
