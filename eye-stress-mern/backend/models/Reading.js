const mongoose = require('mongoose');

const ReadingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  filename: String,
  path: String,
  chartUrl: String,
  mimetype: String,
  stressScore: Number,
  report: String,
  note: String,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Reading', ReadingSchema);
