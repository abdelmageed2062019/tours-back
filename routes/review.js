const express = require("express");
const Review = require("../models/Review");
const Tour = require("../models/Tour");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const upload = require("../middleware/multer");
const router = express.Router();

// Create a new review
router.post(
  "/:tourId",
  auth,
  upload.array("media", 10),

  async (req, res) => {
    try {
      const { rating, comment, userId } = req.body; // Extract body data
      const { tourId } = req.params; // Extract the tourId from the URL

      // Map uploaded media files to objects containing URL and type
      const media = req.files.map((file) => ({
        url: `${req.protocol}://${req.get("host")}/uploads/${file.filename}`,
        type: file.mimetype.startsWith("image") ? "image" : "video",
      }));

      // Find the tour by ID to ensure it exists
      const tour = await Tour.findById(tourId);
      console.log(tour);

      if (!tour) {
        return res.status(404).json({ error: "Tour not found" });
      }

      // Create a new review instance
      const review = new Review({
        user: userId,
        tour: tourId,
        rating,
        comment,
        media,
      });

      // Save the review
      await review.save();

      // Add the review to the tour's reviews array and save the tour
      tour.reviews.push(review);
      await tour.save();

      res.status(201).json({ message: "Review created successfully", review });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Fetch all reviews
router.get("/", async (req, res) => {
  try {
    const reviews = await Review.find().populate("user tour");
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.patch("/:id/visibility", auth, admin, async (req, res) => {
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
router.get("/:tourId", async (req, res) => {
  try {
    const { tourId } = req.params;
    const reviews = await Review.find({ tour: tourId }).populate("user");
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Fetch all reviews made by a specific user
router.get("/:userId", auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const reviews = await Review.find({ user: userId }).populate("tour");
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a specific review by ID
router.delete("/:id", auth, admin, async (req, res) => {
  try {
    const deletedReview = await Review.findByIdAndDelete(req.params.id);
    if (!deletedReview) {
      return res.status(404).json({ message: "Review not found" });
    }
    res.json({ message: "Review deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
