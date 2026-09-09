import mongoose from 'mongoose';

const { Schema } = mongoose;

const quizQuestionSchema = new Schema(
  {
    text: { type: String, required: true, trim: true, maxlength: 300 },
    options: {
      type: [String],
      required: true,
      validate: {
        validator: (arr) => arr.length === 4 && arr.every((o) => o.trim().length > 0),
        message: 'Each question needs exactly 4 non-empty options'
      }
    },
    correctIndex: { type: Number, required: true, min: 0, max: 3 }
  },
  { _id: false }
);

const quizSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 80 },
    description: { type: String, trim: true, maxlength: 200, default: '' },
    // A loose tag onto one of the built-in categories, purely so the quiz
    // can borrow that category's color/icon in the UI — it does not pull
    // questions from the shared Question bank.
    category: {
      type: String,
      enum: ['cinema', 'geo', 'food', 'sport', 'proverbs'],
      default: 'proverbs'
    },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    isPublic: { type: Boolean, default: true },
    questions: {
      type: [quizQuestionSchema],
      required: true,
      validate: {
        validator: (arr) => arr.length >= 3 && arr.length <= 30,
        message: 'A quiz needs between 3 and 30 questions'
      }
    },
    playCount: { type: Number, default: 0 }
  },
  { timestamps: true }
);

quizSchema.methods.toSummaryJSON = function toSummaryJSON() {
  return {
    id: this._id.toString(),
    title: this.title,
    description: this.description,
    category: this.category,
    createdBy: this.createdBy,
    questionCount: this.questions.length,
    playCount: this.playCount,
    createdAt: this.createdAt
  };
};

export default mongoose.model('Quiz', quizSchema);
