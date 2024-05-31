require("dotenv").config();
// app.js
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const upload = require("./util/file_upload");
const path = require("path");

// Set storage engine

const {
  createQuotation,
  getQuotations,
  deleteQuotation,
  editQuotation,
} = require("./controllers/quotationControllers");
const userController = require("./controllers/userController");
const priceController = require("./controllers/priceController");
const { loginWithGoogle } = require("./controllers/authController");

const app = express();
const port = process.env.port;

// MongoDB connection string
const mongoURI = process.env.mongoURI;

// Connect to MongoDB
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", function () {
  console.log("Connected to MongoDB");
});

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Routes
app.get('/', (req, res) => {
    res.send('Hello... your backend server is connected!');
});
app.post("/create_quotation", createQuotation);
app.get("/quotations", getQuotations);
app.post("/users", upload, userController.createUser);
app.put("/quotations/:id", editQuotation);
app.post("/login", userController.login);
app.post("/logout", userController.logout);
app.post("/forgot_password", userController.forgotPassword);
app.post("/reset_password", userController.resetPassword);
app.post("/verify_code", userController.verifyCode);
app.post("/prices", priceController.savePrice);
app.delete("/quotations/:id", deleteQuotation);
app.get("/get_prices", priceController.getAllPrices);
app.post("/googleSignIn", userController.googleSignIn);
app.get("/users/:userId", userController.getUser);
app.put("/users/:userId", upload, userController.updateUser);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.get("/validate_token", userController.validateToken);
// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
