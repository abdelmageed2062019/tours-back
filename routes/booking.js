const express = require("express");
const Booking = require("../models/Booking");
const Tour = require("../models/Tour");
const User = require("../models/User");
const router = express.Router();
const auth = require("../middleware/auth");
const admin = require("../middleware/admin"); // Import the admin middleware
const { parse } = require("json2csv");

// Create a new booking
router.post("/", auth, async (req, res) => {
  const {
    email,
    arrivalDate,
    departureDate,
    tripLocation,
    adults,
    children6To11,
    childrenUnder6,
    transportation,
    guide,
    car,
    additionalQueries,
    userId,
    tourId,
    date,
    time,
    cellPhone,
    paymentName,
    amount,
  } = req.body;

  try {
    // Validate user and tour existence
    const user = await User.findById(userId);
    const tour = await Tour.findById(tourId);

    console.log(user, tour);

    if (!user || !tour) {
      return res.status(404).json({ message: "User or Tour not found" });
    }

    // Create a new booking
    const newBooking = new Booking({
      user: userId,
      tour: tourId,
      email,
      arrivalDate,
      departureDate,
      tripLocation,
      adults,
      children6To11,
      childrenUnder6,
      transportation,
      guide,
      car,
      additionalQueries,
      date,
      time,
      cellPhone,
      paymentName,
      amount,
      status: "pending",
    });

    await newBooking.save();
    res.status(201).json(newBooking);
  } catch (error) {
    res.status(500).json({ message: "Error creating booking", error });
  }
});

// Get all bookings with pagination (admin only)
router.get("/", auth, admin, async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  const pageNumber = Math.max(1, parseInt(page));
  const limitNumber = Math.max(1, parseInt(limit));

  try {
    const bookings = await Booking.find()
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber)
      .populate("user")
      .populate("tour")
      .exec();

    const totalAmountResult = await Booking.aggregate([
      { $group: { _id: null, totalAmount: { $sum: "$amount" } } },
    ]);

    const totalAmount = totalAmountResult[0]?.totalAmount || 0;
    const total = await Booking.countDocuments();

    res.json({
      bookings,
      meta: {
        total,
        totalAmount,
        page: pageNumber,
        pages: Math.ceil(total / limitNumber),
      },
    });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res
      .status(500)
      .json({ message: "Error fetching bookings", error: error.message });
  }
});

// Get bookings for a specific month and download as CSV (admin only)
router.get("/download/:year/:month", auth, admin, async (req, res) => {
  const { year, month } = req.params;

  try {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const bookings = await Booking.find({
      date: {
        $gte: startDate,
        $lte: endDate,
      },
    }).populate("user tour");

    if (!bookings.length) {
      return res
        .status(404)
        .json({ message: "No bookings found for this period" });
    }

    const fields = [
      { label: "Booking ID", value: "_id" },
      { label: "Full Name", value: "fullName" },
      { label: "User Email", value: "email" },
      { label: "Tour Name", value: "tour.title" },
      { label: "Arrival Date", value: "arrivalDate" },
      { label: "Departure Date", value: "departureDate" },
      { label: "Trip Location", value: "tripLocation" },
      { label: "Adults", value: "adults" },
      { label: "Children (6-11)", value: "children6To11" },
      { label: "Children (<6)", value: "childrenUnder6" },
      { label: "Transportation", value: "transportation" },
      { label: "Guide", value: "guide" },
      { label: "Car", value: "car" },
      { label: "Additional Queries", value: "additionalQueries" },
      { label: "Date", value: "date" },
      { label: "Time", value: "time" },
      { label: "Cell Phone", value: "cellPhone" },
      { label: "Payment Name", value: "paymentName" },
      { label: "Amount", value: "amount" },
      { label: "Status", value: "status" },
    ];

    const csv = parse(bookings, { fields });

    res.header("Content-Type", "text/csv");
    res.attachment(`bookings_${year}_${month}.csv`);
    res.send(csv);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching or downloading bookings", error });
  }
});
// Get all bookings with pagination (admin only)
router.get("/", auth, admin, async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  // Validate page and limit
  const pageNumber = Math.max(1, parseInt(page));
  const limitNumber = Math.max(1, parseInt(limit));

  try {
    const bookings = await Booking.find()
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber)
      .populate("user tour")
      .exec();

    // Calculate the total amount of the bookings
    const totalAmountResult = await Booking.aggregate([
      { $group: { _id: null, totalAmount: { $sum: "$amount" } } },
    ]);

    const totalAmount = totalAmountResult[0]
      ? totalAmountResult[0].totalAmount
      : 0; // Safely access totalAmount
    const total = await Booking.countDocuments();

    // Send bookings and meta data in the response
    res.json({
      bookings,
      meta: {
        total, // Total number of bookings
        totalAmount, // Total sum of all bookings' amounts
        page: pageNumber, // Current page
        pages: Math.ceil(total / limitNumber), // Total pages
      },
    });
  } catch (error) {
    console.error("Error fetching bookings:", error); // Log the error for debugging
    res
      .status(500)
      .json({ message: "Error fetching bookings", error: error.message });
  }
});

// Get all bookings for a specific user
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

// Get a specific booking by ID
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

// Update a specific booking by ID (update any field)
router.put("/:id", auth, admin, async (req, res) => {
  try {
    const allowedUpdates = ["time", "cellPhone", "status"];
    const updates = Object.keys(req.body);

    const isValidUpdate = updates.every((update) =>
      allowedUpdates.includes(update)
    );
    if (!isValidUpdate) {
      return res
        .status(400)
        .json({ message: "Invalid fields in request body" });
    }

    const updatedBooking = await Booking.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true, runValidators: true }
    );

    if (!updatedBooking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.json({
      message: "Booking updated successfully",
      booking: updatedBooking,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating booking",
      error: error.message || error,
    });
  }
});

// Delete a specific booking by ID
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
