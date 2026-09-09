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
      required: true,
      enum: ['cinema', 'geo', 'food', 'sport', 'proverbs']
    },
    mode: { type: String, enum: ['1v1', 'group'], default: 'group' },
    questionCount: { type: Number, default: 10, min: 5, max: 25 },
    timePerQuestion: { type: Number, default: 15, min: 5, max: 60 },
    status: { type: String, enum: ['lobby', 'playing', 'ended'], default: 'lobby' },
    players: { type: [roomPlayerSchema], default: [] },
    startedAt: Date,
    endedAt: Date
  },
  { timestamps: true }
);

export default mongoose.model('Room', roomSchema);
