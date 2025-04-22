const jwt = require("jsonwebtoken");
const Blacklist = require("../Model/Blacklist");

async function verifyToken(req, res, next) {
  // Extract the token from the "Authorization" header.
  const token = req.headers["authorization"]?.split(" ")[1];
  // console.log(token);
  if (!token) {
    return res.status(403).json({ message: "No token provided." });
  }
  // jwt.verify(token, process.env.JWT_SECRET_KEY, (err, user) => {
  //   if (err) {
  //     return res.status(403).json({ message: "Invalid token." });
  //   }
  //   req.user = user;
  //   next();
  // });
  try {
    // Await the blacklist check.
    const blacklistedToken = await Blacklist.findOne({ token });
    if (blacklistedToken) {
      return res.status(401).json({ message: "Token has been blacklisted." });
    }
    // Synchronously verify the token. This will throw an error if invalid.
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Save the decoded user information into the request object.
    req.user = decoded;
    next(); // Proceed to the next middleware or route handler.
  } catch (error) {
    console.error("Authentication error:", error);

    // Check the error type and respond accordingly.
    if (
      error.name === "TokenExpiredError" ||
      error.name === "JsonWebTokenError"
    ) {
      return res.status(403).json({ message: "Invalid or expired token." });
    }
    return res.status(500).json({ message: "Internal server error." });
  }
}

module.exports = verifyToken;
