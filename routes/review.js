const express = require("express");
const Review = require("../models/Review");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const upload = require("../middleware/multer");
const router = express.Router();

// Create a new review
router.post("/", auth, upload.array("media", 10), async (req, res) => {
  try {
    const { tourId, rating, comment, userId } = req.body;

    const media = req.files.map((file) => ({
      url: `${req.protocol}://${req.get("host")}/uploads/${file.filename}`,
      type: file.mimetype.startsWith("image") ? "image" : "video",
    }));

    const review = new Review({
      user: userId,
      tour: tourId,
      rating,
      comment,
      media,
    });

    await review.save();
    res.status(201).json({ message: "Review created successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Fetch all reviews
router.get("/", async (req, res) => {
  try {
    const reviews = await Review.find().populate("user tour");
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.patch("/reviews/:id/visibility", authadmin, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).send("Review not found");
    }

    // Toggle visibility
    review.visible = !review.visible;
    await review.save();

    res.status(200).send({ message: "Review visibility updated", review });
  } catch (error) {
    res.status(500).send("Server error");
  }
});

// Fetch all reviews for a specific tour
router.get("/tour/:tourId", async (req, res) => {
  try {
    const { tourId } = req.params;
    const reviews = await Review.find({ tour: tourId }).populate("user");
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Fetch all reviews made by a specific user
router.get("/user/:userId", auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const reviews = await Review.find({ user: userId }).populate("tour");
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
