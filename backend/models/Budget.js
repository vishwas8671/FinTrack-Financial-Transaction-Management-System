import mongoose from 'mongoose';

const budgetSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: [
        'All',
        'Food',
        'Shopping',
        'Bills',
        'Travel',
        'Entertainment',
        'Investments',
        'Others',
      ],
    },
    limitAmount: {
      type: Number,
      required: [true, 'Please add a limit amount'],
      min: [0, 'Limit cannot be negative'],
    },
    month: {
      type: String,
      required: true, // e.g., "2026-05"
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure unique budget per category per month per user
budgetSchema.index({ user: 1, category: 1, month: 1 }, { unique: true });

const Budget = mongoose.model('Budget', budgetSchema);
export default Budget;
