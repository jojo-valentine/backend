const User = require("../Model/User");
const Joi = require("joi");
const bcrypt = require("bcryptjs");
const validateRegistration = require("../validation/RegisterValidator");
const validateLogin = require("../validation/LoginValidator");
const jwt = require("jsonwebtoken");
const Blacklist = require("../Model/Blacklist");
// const redis = require("redis");
// const client = redis.createClient({
//   url: process.env.REDIS_URL,
// });

const {
  AppError,
  handleValidationError,
  handleDatabaseError,
  sendErrorDev,
  sendErrorProd,
} = require("../utils/errorHandler");

exports.createUser = async (req, res) => {
  try {
    console.log("Received Data:", req.body);
    const { isValid, errors } = validateRegistration(req.body); // Assuming validateRegistration is correct

    if (!isValid) {
      console.error("Validation failed:", errors);
      // const errorDetails = errors.map((error) => ({}));
      // return res.status(400).json({
      //   message: "Validation failed.",
      //   errors: errors,
      // });

      return res.status(400).json({
        message: "Validation failed.",
        errors: errors.map((error) => ({
          field: error.field,
          message: error.message,
        })),
      });
    }

    const { name, email, password } = req.body;

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    // Check if the email already exists in the database
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      // throw new AppError("E-mail already in use", 400); // Custom error with status 400
      return res.status(400).json({
        message: "Validation failed.",
        errors: [
          {
            field: "email",
            message: "E-mail already in use",
          },
        ],
      });
    }

    // Save the new user to the database
    const dataUser = { name, email, password: password };
    const newUser = new User(dataUser);
    await newUser.save();
    res
      .status(201)
      .json({ message: "User created successfully", user: newUser });
  } catch (error) {
    console.error(error);
    // If it's an operational error (like validation or email conflict)
    if (error instanceof AppError) {
      if (process.env.NODE_ENV === "development") {
        sendErrorDev(error, res); // Send error details in development mode
      } else {
        sendErrorProd(error, res); // Send generic error in production mode
      }
    } else {
      // Handle unexpected errors (e.g., database failures)
      const unknownError = new AppError("Something went wrong", 500);
      if (process.env.NODE_ENV === "development") {
        sendErrorDev(unknownError, res); // Send error details in development mode
      } else {
        sendErrorProd(unknownError, res); // Send generic error in production mode
      }
    }
  }
};

exports.listDataUser = async (req, res) => {
  try {
    const dataList = await User.find();
    const homeData = {
      message: "Welcome to the Home Page",
      dataList: dataList,
    };
    res.json(homeData);
  } catch (error) {
    console.error("❌ Error fetching user data:", error);
    res.status(500).json({ error: "Something went wrong!" });
  }
};

exports.loginUser = async (req, res) => {
  try {
    console.log(req.body);
    // const { email, password } = validationLogin(req.body);
    const { isValid, errors } = validateLogin(req.body); // Assuming validateRegistration is correct
    if (!isValid) {
      console.error("Validation failed:", errors);
      const { email, password } = req.body;

      return res.status(400).json({
        message: "Validation failed.",
        errors: errors.map((error) => ({
          field: error.field,
          message: error.message,
        })),
      });
    }
    const { email, password } = req.body;
    const user = await User.findOne({
      email: email,
      // password: password,
    });
    if (!user) {
      return res.status(400).json({
        message: "User not found.",
        errors: [
          {
            field: "email",
            message: "User not found.",
          },
        ],
      });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid email or password.",
        errors: [
          {
            field: "password",
            message: "Invalid email or password.",
          },
        ],
      });
    }
    const token = jwt.sign(
      { userId: user._id, name: user.name, email: user.email },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });
    res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
      token,
    });
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).json({ error: "Something went wrong!" });
  }
};

exports.logoutUser = async (req, res) => {
  try {
    const token = req.headers["authorization"]?.split(" ")[1];
    if (!token) {
      return res.status(400).json({ message: "Invalid token format" });
    }

    // Verify the token
    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: "Invalid Token" });
      }

      // Blacklist the token
      const blacklistedToken = new Blacklist({
        token: token,
        exp: decoded.exp,
        sameSite: "strict",
      });
      console.log(blacklistedToken);
      await blacklistedToken.save();
      res.clearCookie("token");
      return res.status(200).json({
        message: "Logged out successfully. Token blacklisted.",
      });
    });
  } catch (error) {
    console.error("Error during logout:", error);
    res.status(500).json({ error: "Something went wrong!" });
  }
};
