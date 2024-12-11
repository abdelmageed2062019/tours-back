const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  tour: { type: mongoose.Schema.Types.ObjectId, ref: "Tour", required: true },
  email: { type: String, required: true, match: /.+\@.+\..+/ }, // Email with basic regex validation
  arrivalDate: { type: Date, required: true }, // Arrival date
  departureDate: { type: Date, required: true }, // Departure date
  tripLocation: { type: String, required: true }, // Trip location
  adults: { type: Number, required: true, min: 1 }, // Number of adults
  children6To11: { type: Number, default: 0, min: 0 }, // Number of children aged 6-11
  childrenUnder6: { type: Number, default: 0, min: 0 }, // Number of children under 6
  transportation: { type: String, required: true }, // Transportation details
  guide: { type: String, required: true }, // Guide selection
  car: { type: String, required: true }, // Car selection
  additionalQueries: { type: String, default: "" }, // Any additional queries
  date: { type: Date, required: true }, // Booking date
  time: { type: String, required: true }, // Booking time
  cellPhone: { type: String, required: true, match: /^[0-9]{10,15}$/ }, // Cell phone number with regex
  paymentName: { type: String, required: true }, // Payment method or name
  amount: { type: Number, required: true }, // Total payment amount
  status: {
    type: String,
    enum: ["pending", "confirmed", "cancelled"],
    default: "pending", // Booking status
  },
  createdAt: { type: Date, default: Date.now }, // Record creation timestamp
});

module.exports = mongoose.model("Booking", bookingSchema);
