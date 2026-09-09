import mongoose from 'mongoose';

const { Schema } = mongoose;

const localizedStringSchema = new Schema(
  {
    en: { type: String, required: true },
    ar: { type: String, required: true }
  },
  { _id: false }
);

const questionSchema = new Schema(
  {
    category: {
      type: String,
      required: true,
      enum: ['cinema', 'geo', 'food', 'sport', 'proverbs'],
      index: true
    },
    text: { type: localizedStringSchema, required: true },
    options: {
      type: [localizedStringSchema],
      required: true,
      validate: (arr) => arr.length === 4
    },
    correctIndex: { type: Number, required: true, min: 0, max: 3 },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' }
  },
  { timestamps: true }
);

// Server never sends correctIndex to clients before reveal — this helper
// builds the "safe" shape used in the question:new socket payload.
questionSchema.methods.toPublicJSON = function toPublicJSON(locale = 'en') {
  return {
    id: this._id.toString(),
    text: this.text[locale] || this.text.en,
    options: this.options.map((o) => o[locale] || o.en)
  };
};

export default mongoose.model('Question', questionSchema);
