const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Reading = require('../models/Reading');
const auth = require('../middleware/authMiddleware');

const storage = multer.diskStorage({
  destination: function (req, file, cb) { cb(null, path.join(__dirname, '..', 'uploads')); },
  filename: function (req, file, cb) {
    const unique = Date.now() + '-' + Math.round(Math.random()*1E9);
    cb(null, unique + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// simulate analysis function
function analyzeImage(filePath){
  const base = Math.floor(Math.random()*60) + 20;
  return Math.min(100, base);
}

// POST /api/upload (protected)
router.post('/upload', auth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const filePath = '/uploads/' + req.file.filename;
    const score = analyzeImage(req.file.path);
    const note = req.body.note || '';
    const reading = new Reading({
      userId: req.user.id,
      filename: req.file.filename,
      path: filePath,
      mimetype: req.file.mimetype,
      stressScore: score,
      note
    });
    await reading.save().catch(()=>{});
    res.json({ ok:true, id: reading._id, score, path: filePath, createdAt: reading.createdAt });
  } catch(err){
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/readings (protected) - user's readings
router.get('/readings', auth, async (req, res) => {
  try {
    const list = await Reading.find({ userId: req.user.id }).sort({ createdAt: -1 }).limit(200);
    res.json(list);
  } catch(err){
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET single reading (protected)
router.get('/readings/:id', auth, async (req, res) => {
  try {
    const r = await Reading.findById(req.params.id);
    if (!r) return res.status(404).json({ error: 'Not found' });
    if (r.userId.toString() !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
    res.json(r);
  } catch(err){ console.error(err); res.status(500).json({ error:'Server error' }); }
});

module.exports = router;
