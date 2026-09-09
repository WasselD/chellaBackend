import 'dotenv/config';

function required(key, fallback) {
  const value = process.env[key] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

// Helper to parse comma-separated CORS origins into an array
function parseCorsOrigins(input) {
  const defaults = ['http://localhost:3000', 'https://chellaquiz.vercel.app'];
  if (!input) return defaults;
  
  const customOrigins = input.split(',').map((o) => o.trim()).filter(Boolean);
  return Array.from(new Set([...customOrigins, ...defaults]));
}

export const env = {
  port: Number(process.env.PORT || 5000),
  nodeEnv: process.env.NODE_ENV || 'development',
  clientOrigin: parseCorsOrigins(process.env.CLIENT_ORIGIN),
  mongoUri: required('MONGODB_URI', 'mongodb://localhost:27017/chella'),
  jwtSecret: required('JWT_SECRET', 'dev-only-secret-change-me'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  economy: {
    starterCoins: Number(process.env.STARTER_COINS || 100),
    referralBonusCoins: Number(process.env.REFERRAL_BONUS_COINS || 50),
    referredWelcomeCoins: Number(process.env.REFERRED_WELCOME_COINS || 20)
  }
};

if (env.nodeEnv === 'production') {
  if (env.jwtSecret === 'dev-only-secret-change-me' || env.jwtSecret.length < 32) {
    throw new Error(
      'JWT_SECRET must be set to a strong, random value (32+ chars) in production. ' +
        'Generate one with: node -e "console.log(require(\'crypto\').randomBytes(48).toString(\'hex\'))"'
    );
  }
}