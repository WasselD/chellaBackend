// Centralized, reusable validators. Kept deliberately small and
// dependency-free so every route that touches user input can defend
// itself the same way.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_RE = /^[a-zA-Z0-9_.-]{3,20}$/;
const ROOM_CODE_RE = /^\d{6}$/;

// Mongoose will happily treat an object like `{ "$ne": null }` as a
// query operator if it ends up inside a filter unguarded — so every
// field that reaches a `User.findOne(...)`-style query must first be
// proven to be an actual string, not just "truthy".
export function isNonEmptyString(value, { min = 1, max = Infinity } = {}) {
  return typeof value === 'string' && value.trim().length >= min && value.trim().length <= max;
}

export function isValidEmail(value) {
  return isNonEmptyString(value, { max: 254 }) && EMAIL_RE.test(value.trim());
}

export function isValidUsername(value) {
  return isNonEmptyString(value) && USERNAME_RE.test(value.trim());
}

export function isValidRoomCode(value) {
  return typeof value === 'string' && ROOM_CODE_RE.test(value);
}

// Mirrors the client-side PasswordStrengthMeter so the two can never
// disagree: at least 8 characters and 3 of the 4 character classes.
export function passwordStrength(password) {
  if (typeof password !== 'string') return { score: 0, isStrong: false };

  const checks = {
    length: password.length >= 8,
    lower: /[a-z]/.test(password),
    upper: /[A-Z]/.test(password),
    number: /\d/.test(password),
    symbol: /[^a-zA-Z0-9]/.test(password)
  };

  const classCount = [checks.lower, checks.upper, checks.number, checks.symbol].filter(Boolean).length;
  const score = (checks.length ? 1 : 0) + Math.min(classCount, 3);

  return { score, checks, isStrong: checks.length && classCount >= 3 };
}
