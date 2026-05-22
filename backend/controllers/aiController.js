import Transaction from '../models/Transaction.js';
import Budget from '../models/Budget.js';
import SavingsGoal from '../models/SavingsGoal.js';
import { generateFinancialInsights } from '../utils/aiInsights.js';

// @desc    Get AI-generated financial insights & Health Score
// @route   GET /api/insights
// @access  Private
export const getAIInsights = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Fetch all records for the user
    const transactions = await Transaction.find({ user: userId });
    const budgets = await Budget.find({ user: userId });
    const savingsGoals = await SavingsGoal.find({ user: userId });

    // Generate insights
    const insights = generateFinancialInsights(transactions, budgets, savingsGoals);

    res.json({
      success: true,
      data: insights,
    });
  } catch (error) {
    next(error);
  }
};
