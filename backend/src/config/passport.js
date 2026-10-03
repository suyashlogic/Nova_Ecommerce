import passport from 'passport';
import passportLocal from 'passport-local';
import passportJwt from 'passport-jwt';
import env from './env.js';
import { verifyCredentials, getUserById } from '../services/authService.js';

// These are CommonJS packages, so we take the default export and destructure it
const LocalStrategy = passportLocal.Strategy;
const { Strategy: JwtStrategy, ExtractJwt } = passportJwt;

// --- Login: email + password ---
passport.use(
  new LocalStrategy(
    { usernameField: 'email', passwordField: 'password' },
    async (email, password, done) => {
      try {
        const user = await verifyCredentials(email, password);
        done(null, user || false); // false = credentials rejected
      } catch (err) {
        done(err);
      }
    }
  )
);

// --- Every protected request: JWT from the httpOnly cookie ---
const cookieExtractor = (req) => req?.cookies?.[env.cookieName] ?? null;

passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor]),
      secretOrKey: env.jwtSecret,
      algorithms: ['HS256'], // only accept the algorithm we sign with
    },
    async (payload, done) => {
      try {
        const id = Number(payload.sub);
        if (!Number.isInteger(id)) return done(null, false);

        // Fresh from the DB, so deleted or demoted users are handled immediately
        const user = await getUserById(id);
        done(null, user || false);
      } catch (err) {
        done(err);
      }
    }
  )
);

export default passport;
