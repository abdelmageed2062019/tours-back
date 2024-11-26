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
      single: { type: Number, required: true },
      twoPeople: { type: Number, required: true },
      threeToFive: { type: Number, required: true },
      aboveSix: { type: Number, required: true },
      childSixToEleven: { type: Number, required: true },
      childUnderSix: { type: Number, required: true },
    },
    privateTourWithoutLunch: {
      single: { type: Number, required: true },
      twoPeople: { type: Number, required: true },
      threeToFive: { type: Number, required: true },
      aboveSix: { type: Number, required: true },
      childSixToEleven: { type: Number, required: true },
      childUnderSix: { type: Number, required: true },
    },
    privateTourGuide: {
      single: { type: Number, required: true },
      twoPeople: { type: Number, required: true },
      threeToFive: { type: Number, required: true },
      aboveSix: { type: Number, required: true },
      childSixToEleven: { type: Number, required: true },
      childUnderSix: { type: Number, required: true },
    },
    privateCarWithDriver: {
      single: { type: Number, required: true },
      twoPeople: { type: Number, required: true },
      threeToFive: { type: Number, required: true },
      aboveSix: { type: Number, required: true },
      childSixToEleven: { type: Number, required: true },
      childUnderSix: { type: Number, required: true },
    },
  },
  city: { type: String, required: true },
  reviews: [Review.schema],
});

module.exports = mongoose.model("Tour", tourSchema);
