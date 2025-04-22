const express = require("express");
const cors = require("cors");
const globalErrorHandler = require("./src/middleware/errorMiddleware");
const bodyParser = require("body-parser");
require("dotenv").config();
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const path = require("path");
const app = express();
app.use(express.json());
const PORT = process.env.PORT || 8080;
// Middleware
app.use(cors());
app.use(bodyParser.json()); // Add bodyParser here
app.use(bodyParser.urlencoded({ extended: true }));

// Controllers
// const pageController = require("./Controllers/PageController");
const connectDB = async () => {
  try {
    const connection = await mongoose.connect(process.env.MONGO_URL);
    const dbName = connection.connection.name; // Database name
    const host = connection.connection.host; // Server (host) name
    console.log(`MongoDB connected to database: ${dbName} on server: ${host}`);
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};
// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
app.post("/user", (req, res) => {
  console.log("Received Data:", req.body); // Debugging
  res.json({ message: "User data received!", data: req.body });
});
app.use((err, req, res, next) => {
  console.error(err.stack); // Log the error for debugging
  res.status(500).json({ error: "Something went wrong!" });
});
connectDB();
process.on("SIGINT", async () => {
  console.log("Shutting down server...");
  await mongoose.connection.close();
  process.exit(0);
});
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
const Routes = require("./src/routes/v.1/api");
app.use("/api", Routes);
// app.use('/api/users', userRoutes);
app.use(globalErrorHandler);
// Example route
app.get("/apiTest", (req, res) => {
  res.json({ message: "Hello from the backend!", data: req.body });
});

// // Add a handler for the root URL
// app.get("/", (req, res) => {
//   res.send("Welcome to the backend server!");
// });
// // Additional routes
// app.get("/home", pageController.getHomePageData);

// Global error handling middleware
