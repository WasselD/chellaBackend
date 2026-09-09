import User from '../models/User.js';
import CoinTransaction from '../models/CoinTransaction.js';

// Costs are centralized here so the socket/game layer and any future
// admin/REST endpoints always agree on pricing.
export const HINT_COSTS = {
  fiftyFifty: 20,
  freeze: 15,
  skip: 35
};

export class InsufficientCoinsError extends Error {
  constructor(message = 'Not enough coins') {
    super(message);
    this.name = 'InsufficientCoinsError';
    this.status = 402;
  }
}

/**
 * Atomically deducts coins from a user. Uses a conditional update
 * (coins >= amount) so two simultaneous spends can never overdraw
 * the balance, even under concurrent socket events.
 */
export async function spendCoins(userId, amount, type, meta = {}) {
  if (amount <= 0) throw new Error('spendCoins amount must be positive');

  const user = await User.findOneAndUpdate(
    { _id: userId, coins: { $gte: amount } },
    { $inc: { coins: -amount } },
    { new: true }
  );

  if (!user) throw new InsufficientCoinsError();

  await CoinTransaction.create({
    userId,
    type,
    amount: -amount,
    balanceAfter: user.coins,
    meta
  });

  return user;
}

export async function addCoins(userId, amount, type, meta = {}) {
  if (amount <= 0) throw new Error('addCoins amount must be positive');

  const user = await User.findByIdAndUpdate(userId, { $inc: { coins: amount } }, { new: true });
  if (!user) throw new Error('User not found');

  await CoinTransaction.create({
    userId,
    type,
    amount,
    balanceAfter: user.coins,
    meta
  });

  return user;
}
