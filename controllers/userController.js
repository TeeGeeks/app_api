const User = require("../models/users");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const { generateRandomToken } = require("../util/fnc");
const sendEmail = require("../util/email");

exports.createUser = async (req, res) => {
  console.log(req.body);
  try {
    const {
      companyName,
      companyAddress,
      companyWebsite,
      username,
      phone,
      email,
      password,
    } = req.body;

    // Check if email or username already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      let message = "";
      if (existingUser.email === email) {
        message = "Email already exists";
      } else {
        message = "Username already exists";
      }
      return res.status(400).json({ message });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Handle file upload
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    const file = req.file;
    const logoPath = file.path;
    // Process the uploaded file (save to database, etc.)

    // Create a new user
    const newUser = new User({
      companyName,
      companyAddress,
      companyWebsite,
      username,
      phone,
      email,
      password: hashedPassword, // Store the hashed password
      // Assuming you want to store the file path in the user object
      // Adjust this to match your file handling logic
      logo: logoPath,
    });
    await newUser.save();
    res.status(201).json(newUser); // Send the newly created user as response
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to create user" });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find the user by email
    const user = await User.findOne({ email });

    // If user not found or password does not match, return an error
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const secretKey = "teegeekstoken";

    // Generate the JWT
    const token = jwt.sign({ userId: user._id }, secretKey, {
      // expiresIn: "1hr",
      expiresIn: "1hr",
    });

    const userId = user._id.toString();
    // Return the token
    res.status(200).json({ token, userId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.logout = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];
    // console.log("Token:", token);
    if (token) {
      res.status(200).json({ message: "Logout successful" });
    }

    // Perform any necessary logout logic here
    // For example, if you are using JWT tokens, you can simply respond with a success message
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.googleSignIn = async (req, res) => {
  const { googleIdToken, googleAccessToken } = req.body;
  console.log(req.body);

  try {
    // Verify Google ID token
    const ticket = await client.verifyIdToken({
      idToken: googleIdToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const email = payload.email;

    // Check if the user exists in your database
    let user = await User.findOne({ email });

    if (!user) {
      // User doesn't exist, create a new user with Google Sign-In
      user = new User({ email });
      await user.save();
    }

    const secretKey = process.env.JWT_SECRET_KEY;

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, secretKey, {
      expiresIn: "1h",
    });

    res.status(200).json({ token });
  } catch (error) {
    console.error("Error during Google Sign-In:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    // Find the user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(404)
        .json({ message: "User with this email does not exist" });
    }

    // Generate a random reset code (4-5 digit number)
    const resetCode = Math.floor(1000 + Math.random() * 9000);

    // Store the reset code and expiration timestamp in the database
    user.resetCode = resetCode;
    user.resetCodeExpiration = Date.now() + 3600000; // Code expires in 1 hour
    await user.save();

    const message = `Dear User,

    You recently requested to reset your password for the Quotation App. Please use the following code to complete the process:
    
    Reset Code: ${resetCode}
    
    If you did not request a password reset, please ignore this email or contact support if you have any concerns.
    
    Best regards,
    The Quotation App Team
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: "Password Reset Request",
        message: message,
      });
      res.status(200).json({
        message:
          "Password reset instructions have been sent to your email address",
      });
    } catch (error) {
      console.error("Failed to send password reset email:", error);
      res.status(500).json({
        message: "Failed to send password reset email. Please try again later",
      });
    }
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.verifyCode = async (req, res) => {
  const { email, code } = req.body;
  if (!email || !code) {
    return res.status(400).send("Email and code are required");
  }

  const user = await User.findOne({
    email,
    resetCode: code,
    resetCodeExpiration: { $gt: Date.now() },
  });

  if (!user) {
    return res.status(400).json({ message: "Invalid or expired reset code" });
  }

  res.status(200).send("Code verified successfully");
};

exports.resetPassword = async (req, res) => {
  const { email, resetCode, newPassword } = req.body;

  try {
    // Find the user by email and reset code
    const user = await User.findOne({
      email,
      resetCode,
      resetCodeExpiration: { $gt: Date.now() }, // Check if reset code is still valid
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired reset code" });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password and clear the reset code
    user.password = hashedPassword;
    user.resetCode = null; // Clear the reset code
    user.resetCodeExpiration = null;
    await user.save();

    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      companyName: user.companyName,
      companyAddress: user.companyAddress,
      companyWebsite: user.companyWebsite,
      username: user.username,
      phone: user.phone,
      email: user.email,
      logo: user.logo,
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.updateUser = async (req, res) => {
  // Just for debugging purposes, remove this line in production
  try {
    const { userId } = req.params;
    const {
      companyName,
      companyAddress,
      companyWebsite,
      username,
      phone,
      email,
    } = req.body;

    if (!companyName || !username || !phone || !email) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.companyName = companyName;
    user.companyAddress = companyAddress;
    user.companyWebsite = companyWebsite;
    user.username = username;
    user.phone = phone;
    user.email = email;

    if (req.file) {
      const file = req.file;
      const logoPath = file.path;

      if (user.logo && fs.existsSync(user.logo)) {
        fs.unlinkSync(user.logo);
      }

      user.logo = logoPath;
    }

    await user.save();
    res.status(200).json({
      companyName: user.companyName,
      companyAddress: user.companyAddress,
      companyWebsite: user.companyWebsite,
      username: user.username,
      phone: user.phone,
      email: user.email,
      logo: user.logo,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.validateToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const secretKey = process.env.JWT_SECRET_KEY;
  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Invalid token" });
    }
    req.user = decoded;
    next();
  });
};
