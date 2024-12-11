const express = require("express");
const Tour = require("../models/Tour");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const upload = require("../middleware/multer");
const Review = require("../models/Review");
const router = express.Router();

// Create Tour
router.post("/", auth, admin, upload.array("media", 10), async (req, res) => {
  try {
    const {
      title,
      description,
      duration,
      pickUpAndDropOff,
      details,
      viewPrice,
      note,
      fullDay,
      type,
      availability,
      languages,
      prices,
      city,
    } = req.body;

    const parsedPrices = JSON.parse(prices);

    const media = req.files.map((file) => ({
      url: `${req.protocol}://${req.get("host")}/uploads/${file.filename}`,
      type: file.mimetype.startsWith("image") ? "image" : "video",
    }));

    const tour = new Tour({
      title,
      description,
      media,
      duration,
      type,
      availability,
      pickUpAndDropOff,
      details,
      viewPrice,
      note,
      fullDay,
      languages,
      prices: parsedPrices,
      city,
      createdBy: req.user._id,
    });
    await tour.save();
    res.status(201).json({
      message: "Tour created successfully",
      tour,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all Tours
router.get("/", async (req, res) => {
  try {
    const tours = await Tour.find().populate("createdBy", "username");
    res.json(tours);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a specific Tour by ID
router.get("/:id", async (req, res) => {
  console.log("Requested Tour ID:", req.params.id); // Log the requested ID
  try {
    const tour = await Tour.findById(req.params.id);
    console.log(tour);
    if (!tour) {
      return res.status(404).json({ message: "Tour not found" });
    }
    res.json(tour);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// Get a Tour by City
router.get("/city/:city", async (req, res) => {
  try {
    const tours = await Tour.find({ city: req.params.city }).populate(
      "createdBy",
      "username"
    );
    res.json(tours);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Additional CRUD routes (update, delete) can be added here
router.put("/:id", auth, admin, async (req, res) => {
  try {
    const {
      title,
      description,
      image,
      duration,
      type,
      pickUpAndDropOff,
      details,
      viewPrice,
      note,
      fullDay,
      availability,
      pickupLocation,
      languages,
      prices,
      city,
    } = req.body;
    const tour = await Tour.findById(req.params.id);
    if (!tour) {
      return res.status(404).json({ message: "Tour not found" });
    }
    tour.title = title;
    tour.description = description;
    tour.image = image;
    tour.duration = duration;
    tour.type = type;
    tour.availability = availability;
    tour.pickupLocation = pickupLocation;
    tour.languages = languages;
    tour.pickUpAndDropOff = pickUpAndDropOff;
    tour.details = details;
    tour.viewPrice = viewPrice;
    tour.note = note;
    tour.fullDay = fullDay;
    tour.prices = prices;
    tour.city = city;
    await tour.save();
    res.json({ message: "Tour updated successfully", tour });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete("/:id", auth, admin, async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);
    if (!tour) {
      return res.status(404).json({ message: "Tour not found" });
    }

    // Delete all reviews associated with the tour
    await Review.deleteMany({ tourId: tour._id });

    // Now delete the tour
    await Tour.findByIdAndDelete(req.params.id);

    res.json({ message: "Tour and associated reviews deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
