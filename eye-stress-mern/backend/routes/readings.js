const express = require("express");
const router = express.Router();
const Reading = require("../models/Reading");
const authMiddleware = require("../middleware/authMiddleware");

// ✅ Save a new reading
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { path, chartUrl, stressScore, report, note } = req.body;

    // Basic validation
    if (!path || !chartUrl) {
      return res.status(400).json({ error: "Missing required fields (path, chartUrl)." });
    }

    const reading = new Reading({
      userId: req.user._id,
      filename: path.split("/").pop() || "unknown_file",
      path,
      chartUrl,
      stressScore: stressScore ?? 0,
      report: report || "No report generated.",
      note: note || "Auto-saved after analysis",
    });

    const saved = await reading.save();
    res.status(201).json(saved);
  } catch (error) {
    console.error("❌ Error saving reading:", error);
    res.status(500).json({ error: "Failed to save reading." });
  }
});

// ✅ Fetch all readings for logged-in user
router.get("/", authMiddleware, async (req, res) => {
  try {
    const readings = await Reading.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(readings);
  } catch (error) {
    console.error("❌ Error fetching readings:", error);
    res.status(500).json({ error: "Failed to fetch readings." });
  }
});

// ✅ Fetch single reading by ID (for detailed 'View' page)
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const reading = await Reading.findById(req.params.id);

    if (!reading) {
      return res.status(404).json({ error: "Result not found." });
    }

    // Ensure the logged-in user owns this reading
    if (reading.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Unauthorized access." });
    }

    res.json(reading);
  } catch (err) {
    console.error("❌ Error fetching single reading:", err);
    res.status(500).json({ error: "Failed to load result." });
  }
});

// ✅ Delete a single reading
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const reading = await Reading.findById(req.params.id);

    if (!reading) {
      return res.status(404).json({ error: "Reading not found." });
    }

    // Only allow the owner to delete
    if (reading.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Unauthorized." });
    }

    await reading.deleteOne();
    res.json({ message: "Reading deleted successfully." });
  } catch (err) {
    console.error("❌ Error deleting reading:", err);
    res.status(500).json({ error: "Failed to delete reading." });
  }
});

// ✅ Delete all readings for logged-in user
router.delete("/", authMiddleware, async (req, res) => {
  try {
    const result = await Reading.deleteMany({ userId: req.user._id });

    res.json({
      message: `🗑️ Deleted ${result.deletedCount} reading(s) successfully.`,
    });
  } catch (err) {
    console.error("❌ Error deleting all readings:", err);
    res.status(500).json({ error: "Failed to delete all readings." });
  }
});

module.exports = router;
