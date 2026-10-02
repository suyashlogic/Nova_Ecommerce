import pg from 'pg';
import env from '../config/env.js';

const { Pool } = pg;

// A pool keeps a set of open connections and reuses them,
// instead of opening a new connection for every request.
const pool = new Pool(env.db);

// Without this handler, an unexpected error on an idle connection
// (e.g. the database restarts) would crash the whole process.
pool.on('error', (err) => {
  console.error('Unexpected PostgreSQL pool error:', err.message);
});

export default pool;