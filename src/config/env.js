import 'dotenv/config';

function required(key, fallback) {
  const value = process.env[key] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export const env = {
  port: Number(process.env.PORT || 5000),
  nodeEnv: process.env.NODE_ENV || 'development',
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:3000',
  mongoUri: required('MONGODB_URI', 'mongodb://localhost:27017/chella'),
  jwtSecret: required('JWT_SECRET', 'dev-only-secret-change-me'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  economy: {
    starterCoins: Number(process.env.STARTER_COINS || 100),
    referralBonusCoins: Number(process.env.REFERRAL_BONUS_COINS || 50),
    referredWelcomeCoins: Number(process.env.REFERRED_WELCOME_COINS || 20)
  }
};
