import mongoose from 'mongoose';

const { Schema } = mongoose;

const categorySchema = new Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      enum: ['cinema', 'geo', 'food', 'sport', 'proverbs']
    },
    name: {
      en: { type: String, required: true },
      ar: { type: String, required: true }
    },
    tagline: {
      en: { type: String, required: true },
      ar: { type: String, required: true }
    },
    color: { type: String, required: true }
  },
  { timestamps: true }
);

export default mongoose.model('Category', categorySchema);
