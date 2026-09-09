import { asyncHandler } from '../utils/asyncHandler.js';

export const getMyReferralStats = asyncHandler(async (req, res) => {
  res.json({
    count: req.user.referralCount,
    coins: req.user.referralCoinsEarned
  });
});
