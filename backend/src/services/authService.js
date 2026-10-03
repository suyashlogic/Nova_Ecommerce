import bcrypt from 'bcrypt';
import pool from '../db/pool.js';
import env from '../config/env.js';

// Hash of a throwaway password. Used so login takes the same time
// whether or not the email exists. (Top-level await works in ES modules.)
const DUMMY_HASH = await bcrypt.hash('not-a-real-password', env.saltRounds);

const USER_COLUMNS = `id, name, email, role, phone, address_line1, address_line2,
                      city, state, postal_code, country, created_at`;

// Whitelist: only these fields ever leave the server. password_hash never does.
function toPublicUser(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    phone: row.phone,
    addressLine1: row.address_line1,
    addressLine2: row.address_line2,
    city: row.city,
    state: row.state,
    postalCode: row.postal_code,
    country: row.country,
    createdAt: row.created_at,
  };
}

export async function registerUser({ name, email, password }) {
  const passwordHash = await bcrypt.hash(password, env.saltRounds);

  // A duplicate email raises Postgres error 23505, which errorHandler maps to 409.
  // The unique index is the real guarantee; no racy "SELECT then INSERT" check.
  const { rows } = await pool.query(
    `INSERT INTO users (name, email, password_hash)
     VALUES ($1, $2, $3)
     RETURNING ${USER_COLUMNS}`,
    [name, email, passwordHash]
  );
  return toPublicUser(rows[0]);
}

// Returns the public user, or null for wrong email OR wrong password
export async function verifyCredentials(email, password) {
  const { rows } = await pool.query(
    'SELECT * FROM users WHERE LOWER(email) = LOWER($1)',
    [email]
  );
  const user = rows[0];

  const passwordMatches = await bcrypt.compare(password, user?.password_hash ?? DUMMY_HASH);
  if (!user || !passwordMatches) return null;

  return toPublicUser(user);
}

export async function getUserById(id) {
  const { rows } = await pool.query(
    `SELECT ${USER_COLUMNS} FROM users WHERE id = $1`,
    [id]
  );
  return rows[0] ? toPublicUser(rows[0]) : null;
}

export async function updateProfile(userId, data) {
  const { rows } = await pool.query(
    `UPDATE users
        SET name = $1, phone = $2, address_line1 = $3, address_line2 = $4,
            city = $5, state = $6, postal_code = $7, country = $8
      WHERE id = $9
      RETURNING ${USER_COLUMNS}`,
    [
      data.name,
      data.phone ?? null,
      data.addressLine1 ?? null,
      data.addressLine2 ?? null,
      data.city ?? null,
      data.state ?? null,
      data.postalCode ?? null,
      data.country ?? null,
      userId,
    ]
  );
  return toPublicUser(rows[0]);
}
