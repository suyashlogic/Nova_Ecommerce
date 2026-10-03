import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import env from './config/env.js';
import './config/passport.js'; // registers the passport strategies (side-effect import)
import routes from './routes/index.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import csrfGuard from './middleware/csrfGuard.js';
import notFound from './middleware/notFound.js';
import errorHandler from './middleware/errorHandler.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

// --- Global middleware ---
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: env.clientUrl, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());
app.use(morgan('dev'));
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));
// Demo product images shipped with the repo (committed to git, unlike /uploads)
app.use('/placeholders', express.static(path.join(__dirname, '..', 'public', 'placeholders')));

// --- API: protections first, then routes ---
app.use('/api', apiLimiter, csrfGuard, routes);

// --- Must be last ---
app.use(notFound);
app.use(errorHandler);

export default app;