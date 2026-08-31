const jwt = require("jsonwebtoken");

// ============================================
// AUTHENTICATION MIDDLEWARE
// ============================================

const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // Check Authorization header
    if (!authHeader) {
      return res.status(401).json({
        status: "error",
        message: "Authorization token is required.",
      });
    }

    // Expected format:
    // Authorization: Bearer TOKEN

    const parts = authHeader.split(" ");

    if (parts.length !== 2 || parts[0] !== "Bearer") {
      return res.status(401).json({
        status: "error",
        message: "Invalid authorization format.",
      });
    }

    const token = parts[1];

    // Verify JWT
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    // Attach authenticated user to request
    req.user = decoded;

    next();
  } catch (error) {
    console.error("Authentication error:", error.message);

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        status: "error",
        message: "Authentication token has expired.",
      });
    }

    return res.status(401).json({
      status: "error",
      message: "Invalid authentication token.",
    });
  }
};

module.exports = authenticateToken;