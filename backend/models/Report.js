import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    month: {
      type: String,
      required: true, // e.g. "2026-05"
    },
    totalIncome: {
      type: Number,
      required: true,
    },
    totalExpense: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      default: 'generated',
    },
  },
  {
    timestamps: true,
  }
);

const Report = mongoose.model('Report', reportSchema);
export default Report;
