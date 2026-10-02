import dotenv from 'dotenv';
dotenv.config({ quiet: true });

const required = ['PG_DATABASE', 'PG_PASSWORD', 'JWT_SECRET'];
for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

const env = {
  port: Number(process.env.PORT) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',

  db: {
    user: process.env.PG_USER || 'postgres',
    host: process.env.PG_HOST || 'localhost',
    database: process.env.PG_DATABASE,
    password: process.env.PG_PASSWORD,
    port: Number(process.env.PG_PORT) || 5432,
  },

  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  saltRounds: Number(process.env.BCRYPT_SALT_ROUNDS) || 12,

  cookieName: process.env.COOKIE_NAME || 'nova_token',
  cookieSecure: process.env.COOKIE_SECURE === 'true',
  cookieSameSite: process.env.COOKIE_SAMESITE || 'lax',

  maxUploadMb: Number(process.env.MAX_UPLOAD_MB) || 2,
};

export default env;