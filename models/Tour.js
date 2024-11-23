const mongoose = require("mongoose");
const Review = require("./Review");

const mediaSchema = new mongoose.Schema({
  url: { type: String, required: true },
  type: { type: String, enum: ["image", "video"], required: true },
  caption: { type: String },
  uploadedAt: { type: Date, default: Date.now },
});

const tourSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  media: [mediaSchema],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now },
  duration: { type: String },
  type: { type: String },
  availability: { type: String },
  pickupLocation: { type: String },
  languages: [String],
  prices: {
    privateTourWithLunch: {
      single: Number,
      twoPeople: Number,
      threeToFive: Number,
      aboveSix: Number,
      childSixToEleven: Number,
      childUnderSix: Number,
    },
    privateTourWithoutLunch: {
      single: Number,
      twoPeople: Number,
      threeToFive: Number,
      aboveSix: Number,
      childSixToEleven: Number,
      childUnderSix: Number,
    },
    privateTourGuide: {
      single: Number,
      twoPeople: Number,
      threeToFive: Number,
      aboveSix: Number,
      childSixToEleven: Number,
      childUnderSix: Number,
    },
    privateCarWithDriver: {
      group: Number,
      childSixToEleven: Number,
      childUnderSix: Number,
    },
  },
  city: { type: String, required: true },
  reviews: [Review.schema],
});

module.exports = mongoose.model("Tour", tourSchema);
