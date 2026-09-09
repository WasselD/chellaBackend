import Room from '../models/Room.js';

function randomSixDigits() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function generateUniqueRoomCode() {
  let code = randomSixDigits();
  let attempts = 0;

  // Collisions are extremely rare (1 in ~900k) but we guard anyway.
  while (await Room.exists({ code })) {
    code = randomSixDigits();
    attempts += 1;
    if (attempts > 10) throw new Error('Could not generate a unique room code, try again');
  }

  return code;
}
