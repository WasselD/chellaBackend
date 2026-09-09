import mongoose from 'mongoose';

const { Schema } = mongoose;

const roomPlayerSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    username: { type: String, required: true },
    score: { type: Number, default: 0 }
  },
  { _id: false }
);

const roomSchema = new Schema(
  {
    code: { type: String, required: true, unique: true, index: true, length: 6 },
    hostId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    category: {
      type: String,
      enum: ['cinema', 'geo', 'food', 'sport', 'proverbs'],
      default: null
    },
    // Set instead of `category` when the room plays a user-created quiz.
    // `quizTitle` is a denormalized snapshot so the room/lobby UI and
    // match history don't need to look the quiz back up later.
    quizId: { type: Schema.Types.ObjectId, ref: 'Quiz', default: null },
    quizTitle: { type: String, default: null },
    mode: { type: String, enum: ['1v1', 'group'], default: 'group' },
    questionCount: { type: Number, default: 10, min: 3, max: 30 },
    timePerQuestion: { type: Number, default: 15, min: 5, max: 60 },
    status: { type: String, enum: ['lobby', 'playing', 'ended'], default: 'lobby' },
    players: { type: [roomPlayerSchema], default: [] },
    startedAt: Date,
    endedAt: Date
  },
  { timestamps: true }
);

roomSchema.pre('validate', function requireCategoryOrQuiz(next) {
  if (!this.category && !this.quizId) {
    return next(new Error('A room needs either a category or a quizId'));
  }
  next();
});

export default mongoose.model('Room', roomSchema);
