const jwt = require("jsonwebtoken");

const protect = async (req, res, next) => {
  try {

    let token;

    // Check token exists
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {

      token = req.headers.authorization.split(" ")[1];

      // Verify token
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET
      );

      // Save user info in request
      req.user = decoded;

      next();

    } else {
      return res.status(401).json({
        message: "Not authorized, no token",
      });
    }

  } catch (error) {
    console.log(error);

    return res.status(401).json({
      message: "Token failed",
    });
  }
};

module.exports = { protect };