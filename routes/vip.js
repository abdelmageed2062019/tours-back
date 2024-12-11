const express = require("express");
const VIP = require("../models/Vip");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

const router = express.Router();

// Add a new VIP
router.post("/vip", auth, admin, async (req, res) => {
  try {
    const vip = new VIP(req.body);
    const savedVIP = await vip.save();
    res.status(201).json(savedVIP);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all VIPs
router.get("/vip", auth, async (req, res) => {
  try {
    const vips = await VIP.find();
    res.status(200).json(vips);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a specific VIP by ID
router.get("/vip/:id", auth, async (req, res) => {
  try {
    const vip = await VIP.findById(req.params.id);
    if (!vip) return res.status(404).json({ error: "VIP not found" });
    res.status(200).json(vip);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a VIP by ID
router.put("/vip/:id", async (req, res) => {
  try {
    const updatedVIP = await VIP.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updatedVIP) return res.status(404).json({ error: "VIP not found" });
    res.status(200).json(updatedVIP);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete a VIP by ID
router.delete("/vip/:id", async (req, res) => {
  try {
    const deletedVIP = await VIP.findByIdAndDelete(req.params.id);
    if (!deletedVIP) return res.status(404).json({ error: "VIP not found" });
    res.status(200).json({ message: "VIP deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
