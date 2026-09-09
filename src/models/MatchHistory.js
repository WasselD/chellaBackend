import mongoose from 'mongoose';

const { Schema } = mongoose;

const matchHistorySchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    roomCode: { type: String, required: true },
    category: {
      type: String,
      enum: ['cinema', 'geo', 'food', 'sport', 'proverbs'],
      default: null
    },
    quizId: { type: Schema.Types.ObjectId, ref: 'Quiz', default: null },
    quizTitle: { type: String, default: null },
    score: { type: Number, required: true },
    placement: { type: Number, required: true }, // 1 = winner
    totalPlayers: { type: Number, required: true },
    coinsEarned: { type: Number, default: 0 },
    playedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

matchHistorySchema.methods.toPublicJSON = function toPublicJSON() {
  return {
    id: this._id.toString(),
    roomCode: this.roomCode,
    category: this.category,
    quizTitle: this.quizTitle,
    score: this.score,
    placement: this.placement,
    totalPlayers: this.totalPlayers,
    coinsEarned: this.coinsEarned,
    playedAt: this.playedAt
  };
};

export default mongoose.model('MatchHistory', matchHistorySchema);
