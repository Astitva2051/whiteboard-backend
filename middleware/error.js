/**
 * Error handling middleware
 */
const errorHandler = (err, req, res, next) => {
  // Log to console for dev
  console.error(err.stack);

  // Mongoose bad ObjectId
  if (err.name === "CastError") {
    const message = `Resource not found`;
    return res.status(404).json({
      success: false,
      message,
    });
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = "Duplicate field value entered";
    return res.status(400).json({
      success: false,
      message,
    });
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors).map((val) => val.message);
    return res.status(400).json({
      success: false,
      message,
    });
  }

  // All other errors
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Server Error",
  });
};

module.exports = errorHandler;
