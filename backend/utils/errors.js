/**
 * Custom error class for API-specific errors.
 * Allows attaching a status code to the error.
 */
class APIError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'APIError'; // Optional: Set error name
  }
}

module.exports = { APIError };