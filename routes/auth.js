import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";  // ✅ Import User model

const router = express.Router();

// ✅ Signup Route
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if all fields are provided
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Validate name format (only letters, no numbers or special characters)
    if (!/^[A-Za-z\s]+$/.test(name)) {
      return res.status(400).json({ message: "Name should contain only letters." });
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: "Invalid email format." });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long." });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists! Try logging in." });
    }

    // Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create User
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: "Signup successful! Please log in." });

  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({ message: "Internal Server Error. Please try again later." });
  }
});

// ✅ Login Route
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validate email and password fields
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found. Please sign up first." });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Incorrect password." });

    // Generate token with 1 hour expiry
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.json({ token, user: { name: user.name, email: user.email } });

  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// ✅ Get Logged-in User Data
router.get("/me", async (req, res) => {
  try {
    const token = req.header("Authorization")?.split(" ")[1];

    if (!token) return res.status(401).json({ message: "Access Denied! No token provided." });

    try {
      const verified = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(verified.id).select("-password"); // Exclude password
      if (!user) return res.status(404).json({ message: "User not found." });

      res.json(user);
    } catch (error) {
      return res.status(403).json({ message: "Session expired. Please login again." });
    }

  } catch (error) {
    console.error("User Data Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

export default router;
