import { customAlphabet } from 'nanoid';
import User from '../models/User.js';
import { addCoins } from './coinService.js';
import { env } from '../config/env.js';

// Unambiguous alphabet (no 0/O/1/I) so codes are easy to read aloud or
// type in from a screenshot.
const nanoid = customAlphabet('ABCDEFGHJKMNPQRSTUVWXYZ23456789', 6);

export function generateReferralCode() {
  return nanoid();
}

/**
 * Called right after a new user is created with a referral code.
 * Credits the referrer with REFERRAL_BONUS_COINS and gives the new
 * player a smaller welcome bonus for having used a code at all.
 * Silently no-ops for invalid/self-referral codes rather than failing
 * registration.
 */
export async function applyReferral(newUser, referralCode) {
  if (!referralCode) return null;

  const referrer = await User.findOne({ referralCode: referralCode.trim().toUpperCase() });
  if (!referrer || referrer._id.equals(newUser._id)) return null;

  newUser.referredBy = referrer._id;
  await newUser.save();

  await addCoins(referrer._id, env.economy.referralBonusCoins, 'referral_bonus', {
    referredUserId: newUser._id
  });
  await User.updateOne(
    { _id: referrer._id },
    { $inc: { referralCount: 1, referralCoinsEarned: env.economy.referralBonusCoins } }
  );

  await addCoins(newUser._id, env.economy.referredWelcomeCoins, 'referred_bonus', {
    referrerId: referrer._id
  });

  return referrer;
}
