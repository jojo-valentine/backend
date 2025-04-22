// src/utils/errorHandler.js

// Define the AppError class
class AppError extends Error {
  constructor(message, statusCode) {
    super(message); // เรียกใช้ Error(message) ของ JavaScript
    this.statusCode = statusCode; // กำหนดสถานะ HTTP เช่น 400, 500
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error"; // เช็คว่าเป็น error 4xx หรือ 5xx
    this.isOperational = true; // กำหนดว่าเป็น error ที่รู้จักได้ (Operational Error)
    Error.captureStackTrace(this, this.constructor); // จับ stack trace โดยไม่รวม constructor
  }
}

// Handle validation errors
const handleValidationError = (err) => {
  const message = `Invalid input data. ${err.message}`;
  return new AppError(message, 400);
};

// Handle database-related errors
const handleDatabaseError = (err) => {
  const message = `Database operation failed. ${err.message}`;
  return new AppError(message, 500);
};

// Send error details in development mode
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    stack: err.stack,
  });
};

// Send a generic error in production mode
const sendErrorProd = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.isOperational ? err.message : "Something went wrong!",
  });
};

// Export everything
module.exports = {
  AppError,
  handleValidationError,
  handleDatabaseError,
  sendErrorDev,
  sendErrorProd,
};
