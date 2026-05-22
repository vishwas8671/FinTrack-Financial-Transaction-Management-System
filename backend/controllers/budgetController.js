import Budget from '../models/Budget.js';
import Transaction from '../models/Transaction.js';

// Helper to calculate total spent per category in a specific month
const getSpentAmount = async (userId, category, monthStr) => {
  const startOfMonth = new Date(`${monthStr}-01T00:00:00.000Z`);
  const endOfMonth = new Date(startOfMonth.getFullYear(), startOfMonth.getMonth() + 1, 0, 23, 59, 59, 999);

  const query = {
    user: userId,
    type: 'expense',
    date: { $gte: startOfMonth, $lte: endOfMonth },
  };

  if (category !== 'All') {
    query.category = category;
  }

  const matchStats = await Transaction.aggregate([
    { $match: query },
    {
      $group: {
        _id: null,
        total: { $sum: '$amount' },
      },
    },
  ]);

  return matchStats.length > 0 ? matchStats[0].total : 0;
};

// @desc    Get all budgets for current/specified month
// @route   GET /api/budgets
// @access  Private
export const getBudgets = async (req, res, next) => {
  try {
    const { month } = req.query; // e.g. "2026-05"
    const currentMonth = month || new Date().toISOString().slice(0, 7);

    const budgets = await Budget.find({ user: req.user._id, month: currentMonth });

    // Enriched budgets with actual spent amount calculated in real-time
    const enrichedBudgets = [];
    for (const b of budgets) {
      const spent = await getSpentAmount(req.user._id, b.category, currentMonth);
      enrichedBudgets.push({
        _id: b._id,
        category: b.category,
        limitAmount: b.limitAmount,
        spentAmount: spent,
        month: b.month,
      });
    }

    res.json({ success: true, data: enrichedBudgets });
  } catch (error) {
    next(error);
  }
};

// @desc    Create or update a budget
// @route   POST /api/budgets
// @access  Private
export const createOrUpdateBudget = async (req, res, next) => {
  try {
    const { category, limitAmount, month } = req.body;
    const currentMonth = month || new Date().toISOString().slice(0, 7);

    // Upsert budget
    const budget = await Budget.findOneAndUpdate(
      { user: req.user._id, category, month: currentMonth },
      { limitAmount: Number(limitAmount) },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    const spent = await getSpentAmount(req.user._id, category, currentMonth);

    res.status(200).json({
      success: true,
      data: {
        _id: budget._id,
        category: budget.category,
        limitAmount: budget.limitAmount,
        spentAmount: spent,
        month: budget.month,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a budget
// @route   DELETE /api/budgets/:id
// @access  Private
export const deleteBudget = async (req, res, next) => {
  try {
    const budget = await Budget.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!budget) {
      res.status(404);
      throw new Error('Budget not found');
    }

    res.json({ success: true, message: 'Budget removed' });
  } catch (error) {
    next(error);
  }
};
