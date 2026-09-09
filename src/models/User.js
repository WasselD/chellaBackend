import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    username: { type: String, required: true, unique: true, trim: true, minlength: 3, maxlength: 20 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    coins: { type: Number, default: 0, min: 0 },
    referralCode: { type: String, required: true, unique: true, index: true },
    referredBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    referralCount: { type: Number, default: 0 },
    referralCoinsEarned: { type: Number, default: 0 },
    locale: { type: String, enum: ['en', 'ar'], default: 'en' }
  },
  { timestamps: true }
);

userSchema.methods.setPassword = async function setPassword(plainPassword) {
  this.passwordHash = await bcrypt.hash(plainPassword, 10);
};

userSchema.methods.comparePassword = function comparePassword(plainPassword) {
  return bcrypt.compare(plainPassword, this.passwordHash);
};

// Never leak the password hash to API responses.
userSchema.methods.toPublicJSON = function toPublicJSON() {
  return {
    id: this._id.toString(),
    username: this.username,
    email: this.email,
    coins: this.coins,
    referralCode: this.referralCode,
    referralCount: this.referralCount,
    referralCoinsEarned: this.referralCoinsEarned,
    locale: this.locale
  };
};

export default mongoose.model('User', userSchema);
