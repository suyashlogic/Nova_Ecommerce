export default class AppError extends Error {
  constructor(message, statusCode = 500, details = null) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.details = details;       // e.g. { errors: { email: '...' } }
    this.isOperational = true;    // "expected" error, safe to show the message
  }

  static badRequest(msg = 'Bad request')      { return new AppError(msg, 400); }
  static unauthorized(msg = 'Please log in')  { return new AppError(msg, 401); }
  static forbidden(msg = 'Access denied')     { return new AppError(msg, 403); }
  static notFound(msg = 'Resource not found') { return new AppError(msg, 404); }
  static conflict(msg = 'Conflict')           { return new AppError(msg, 409); }
}