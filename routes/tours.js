const express = require("express");
const Tour = require("../models/Tour");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const upload = require("../middleware/multer");
const router = express.Router();

// Create Tour
router.post("/", auth, admin, upload.array("media", 10), async (req, res) => {
  try {
    const {
      title,
      description,
      duration,
      type,
      availability,
      pickupLocation,
      languages,
      prices,
      city,
    } = req.body;

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
      pickupLocation,
      languages,
      prices,
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
    const tour = await Tour.findByIdAndDelete(req.params.id);
    if (!tour) {
      return res.status(404).json({ message: "Tour not found" });
    }
    res.json({ message: "Tour deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
