const mongoose = require("mongoose");

const mediaSchema = new mongoose.Schema({
  url: { type: String, required: true },
  type: { type: String, enum: ["image", "video"], required: true },
  caption: { type: String },
  uploadedAt: { type: Date, default: Date.now },
});

const featureSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  media: [mediaSchema],
});

const vipSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  features: { type: [featureSchema], required: true },
});

module.exports = mongoose.model("VIP", vipSchema);
