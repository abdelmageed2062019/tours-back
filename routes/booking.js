// routes/bookingRoutes.js
const express = require("express");
const Booking = require("../models/Booking");
const Tour = require("../models/Tour");
const User = require("../models/User");
const router = express.Router();
const auth = require("../middleware/auth");
const admin = require("../middleware/admin"); // Import the admin middleware

// Create a new booking
router.post("/", auth, async (req, res) => {
  const { userId, tourId, date, time, cellPhone, paymentName, amount } =
    req.body;

  try {
    // Validate user and tour existence
    const user = await User.findById(userId);
    const tour = await Tour.findById(tourId);

    if (!user || !tour) {
      return res.status(404).json({ message: "User or Tour not found" });
    }

    // Create a new booking
    const newBooking = new Booking({
      user: userId,
      tour: tourId,
      date,
      time,
      cellPhone,
      paymentName,
      amount, // Include the amount field
    });

    await newBooking.save();
    res.status(201).json(newBooking);
  } catch (error) {
    res.status(500).json({ message: "Error creating booking", error });
  }
});

// Get all bookings (for admin or user)
router.get("/", auth, async (req, res) => {
  try {
    const bookings = await Booking.find().populate("user tour");
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: "Error fetching bookings", error });
  }
});

// Get all bookings for a specific user (for admin or user)
router.get("/user/:userId", auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const bookings = await Booking.find({ user: user._id }).populate("tour");
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: "Error fetching user's bookings", error });
  }
});

// Get a specific booking by ID (for admin or user)
router.get("/:id", auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate("user tour");
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: "Error fetching booking", error });
  }
});

// Update a specific booking by ID (for admin or user)
router.put("/:id", auth, admin, async (req, res) => {
  const { amount } = req.body; // Extract the amount from the request body
  try {
    const updatedBooking = await Booking.findByIdAndUpdate(
      req.params.id,
      { ...req.body, amount }, // Include the amount field in the update
      { new: true }
    );
    if (!updatedBooking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    res.json(updatedBooking);
  } catch (error) {
    res.status(500).json({ message: "Error updating booking", error });
  }
});

// Delete a specific booking by ID (for admin or user)
router.delete("/:id", auth, admin, async (req, res) => {
  try {
    const deletedBooking = await Booking.findByIdAndDelete(req.params.id);
    if (!deletedBooking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    res.json({ message: "Booking deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting booking", error });
  }
});

module.exports = router;
