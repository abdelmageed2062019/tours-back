// routes/auth.js
const express = require("express");
const bcrypt = require("bcryptjs");
const { body, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const router = express.Router();

router.post(
  "/register",
  [
    body("firstName").notEmpty().withMessage("First name is required"),
    body("lastName").notEmpty().withMessage("Last name is required"),
    body("address").notEmpty().withMessage("Address is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
    body("confirmPassword").custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Password confirmation does not match password");
      }
      return true;
    }),
    body("displayName").notEmpty().withMessage("Display name is required"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { firstName, lastName, address, email, password, displayName, role } =
      req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      firstName,
      lastName,
      address,
      email,
      password: hashedPassword,
      displayName,
      role: role || "user",
    });

    try {
      await user.save();

      const token = jwt.sign(
        { userId: user._id, user: role },
        process.env.JWT_SECRET,
        {
          expiresIn: "3d",
        }
      );

      res.status(201).json({ message: "User  registered successfully", token });
    } catch (error) {
      res.status(400).send("Error registering user");
    }
  }
);

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      const token = jwt.sign(
        { userId: user._id, role: user.role },
        process.env.JWT_SECRET,
        {
          expiresIn: "3d",
        }
      );

      res.json({ message: "Login successful", token, user });
    } else {
      res.status(401).send("Invalid credentials");
    }
  }
);

module.exports = router;
