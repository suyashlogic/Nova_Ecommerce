import env from '../config/env.js';

// Friendly messages for known database constraints (names come from schema.sql)
const CONSTRAINT_MESSAGES = {
  users_email_unique_idx: 'An account with this email already exists',
  categories_name_key: 'A category with this name already exists',
  categories_slug_key: 'A category with this slug already exists',
};

// Translate PostgreSQL error codes into HTTP responses
function mapPgError(err) {
  switch (err.code) {
    case '23505': // unique_violation
      return { status: 409, message: CONSTRAINT_MESSAGES[err.constraint] || 'This record already exists' };
    case '23503': // foreign_key_violation
      return { status: 409, message: 'This record is linked to other data and cannot be changed this way' };
    case '23514': // check_violation
      return { status: 400, message: 'A value is outside the allowed range' };
    case '23502': // not_null_violation
      return { status: 400, message: 'A required field is missing' };
    case '22P02': // invalid_text_representation (e.g. id "abc" for an integer)
      return { status: 400, message: 'Invalid identifier or value format' };
    default:
      return null;
  }
}

// eslint-disable-next-line no-unused-vars
export default function errorHandler(err, req, res, next) {
  let status = 500;
  let message = 'Something went wrong on our side';
  let details = null;

  if (err.isOperational) {
    // Our own AppError
    status = err.statusCode;
    message = err.message;
    details = err.details;
  } else if (err.type === 'entity.parse.failed') {
    // express.json() received malformed JSON
    status = 400;
    message = 'Request body contains invalid JSON';
  } else if (err.name === 'MulterError') {
    status = err.code === 'LIMIT_FILE_SIZE' ? 413 : 400;
    message = err.code === 'LIMIT_FILE_SIZE'
      ? `Image is too large (max ${env.maxUploadMb} MB)`
      : 'Invalid file upload';
  } else {
    const pgError = mapPgError(err);
    if (pgError) ({ status, message } = pgError);
  }

  // Log unexpected errors fully. Expected 4xx errors are just noise.
  if (status >= 500) console.error(err);

  res.status(status).json({
    status: 'error',
    message,
    ...(details || {}),
    // Stack traces help while developing but must never reach real users
    ...(env.nodeEnv === 'development' && status >= 500 && { stack: err.stack }),
  });
}