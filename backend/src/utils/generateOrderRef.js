import { randomInt } from 'node:crypto';

// No 0/O/1/I so references are easy to read out over the phone
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

// e.g. NOVA-2026-A8F3K2
export default function generateOrderRef(date = new Date()) {
  let suffix = '';
  for (let i = 0; i < 6; i += 1) suffix += ALPHABET[randomInt(ALPHABET.length)];
  return `NOVA-${date.getFullYear()}-${suffix}`;
}
