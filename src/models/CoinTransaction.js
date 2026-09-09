import mongoose from 'mongoose';

const { Schema } = mongoose;

const COIN_TRANSACTION_TYPES = [
  'signup_bonus',
  'referral_bonus', // credited to the referrer
  'referred_bonus', // credited to the new user who used a code
  'hint_fiftyFifty',
  'hint_freeze',
  'hint_skip',
  'match_reward',
  'admin_adjust'
];

const coinTransactionSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, enum: COIN_TRANSACTION_TYPES, required: true },
    amount: { type: Number, required: true }, // positive = credit, negative = debit
    balanceAfter: { type: Number, required: true },
    meta: { type: Schema.Types.Mixed, default: {} }
  },
  { timestamps: true }
);

export const COIN_TYPES = COIN_TRANSACTION_TYPES;
export default mongoose.model('CoinTransaction', coinTransactionSchema);
