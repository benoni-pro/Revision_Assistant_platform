import mongoose from 'mongoose';

const criterionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  levels: [{ label: String, description: String, score: Number }]
});

const rubricSchema = new mongoose.Schema({
  title: { type: String, required: true },
  genre: { type: String, enum: ['argumentative', 'narrative', 'informative', 'other'], default: 'other' },
  subject: String,
  standards: [String],
  criteria: [criterionSchema],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  isPublic: { type: Boolean, default: true },
}, { timestamps: true });

rubricSchema.index({ genre: 1, isPublic: 1 });
rubricSchema.index({ createdBy: 1 });

export default mongoose.model('Rubric', rubricSchema);

