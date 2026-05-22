import Transaction from '../models/Transaction.js';
import Budget from '../models/Budget.js';
import Notification from '../models/Notification.js';

// Helper to check and trigger budget alerts
const checkBudgetExceeded = async (userId, category, monthStr) => {
  try {
    // Find budget for category in current month
    const budget = await Budget.findOne({ user: userId, category, month: monthStr });
    if (!budget) return;

    // Aggregate expenses for this category in current month
    const startOfMonth = new Date(`${monthStr}-01T00:00:00.000Z`);
    const endOfMonth = new Date(startOfMonth.getFullYear(), startOfMonth.getMonth() + 1, 0, 23, 59, 59, 999);

    const matchStats = await Transaction.aggregate([
      {
        $match: {
          user: userId,
          type: 'expense',
          category,
          date: { $gte: startOfMonth, $lte: endOfMonth },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
        },
      },
    ]);

    const totalSpent = matchStats.length > 0 ? matchStats[0].total : 0;

    if (totalSpent > budget.limitAmount) {
      // Check if alert already exists to prevent duplicate notifications
      const alertExists = await Notification.findOne({
        user: userId,
        type: 'budget_alert',
        title: `Budget Exceeded - ${category}`,
        createdAt: { $gte: startOfMonth, $lte: endOfMonth },
      });

      if (!alertExists) {
        await Notification.create({
          user: userId,
          title: `Budget Exceeded - ${category}`,
          message: `Your spending on ${category} is $${totalSpent.toFixed(2)}, which exceeds your monthly budget of $${budget.limitAmount.toFixed(2)}.`,
          type: 'budget_alert',
        });
      }
    } else if (totalSpent >= budget.limitAmount * 0.8) {
      // 80% warning
      const warningExists = await Notification.findOne({
        user: userId,
        type: 'budget_alert',
        title: `Budget Warning - ${category}`,
        createdAt: { $gte: startOfMonth, $lte: endOfMonth },
      });

      if (!warningExists) {
        await Notification.create({
          user: userId,
          title: `Budget Warning - ${category}`,
          message: `You have spent $${totalSpent.toFixed(2)} (${((totalSpent / budget.limitAmount) * 100).toFixed(0)}%) of your $${budget.limitAmount.toFixed(2)} budget for ${category}.`,
          type: 'budget_alert',
        });
      }
    }
  } catch (error) {
    console.error('Error running budget alert check:', error);
  }
};

// Process recurring transactions that are due
const processRecurringTransactions = async (userId) => {
  try {
    const recurringTxs = await Transaction.find({ user: userId, isRecurring: true, recurringInterval: { $ne: 'none' } });
    const now = new Date();

    for (const tx of recurringTxs) {
      let nextDate = new Date(tx.date);
      const interval = tx.recurringInterval;

      // Determine the next occurrence date
      if (interval === 'weekly') {
        nextDate.setDate(nextDate.getDate() + 7);
      } else if (interval === 'monthly') {
        nextDate.setMonth(nextDate.getMonth() + 1);
      } else if (interval === 'yearly') {
        nextDate.setFullYear(nextDate.getFullYear() + 1);
      }

      // If nextDate is in the past, spawn new transactions recursively up to current date
      while (nextDate <= now) {
        // Check if transaction already exists for this exact title, amount and date
        const txExists = await Transaction.findOne({
          user: userId,
          title: tx.title,
          amount: tx.amount,
          date: nextDate,
        });

        if (!txExists) {
          const newTx = await Transaction.create({
            user: userId,
            title: tx.title,
            amount: tx.amount,
            type: tx.type,
            category: tx.category,
            date: new Date(nextDate),
            description: `Auto-generated recurring payment. Original dated: ${tx.date.toLocaleDateString()}`,
            isRecurring: false, // Child transactions don't need to spin off their own records
          });

          // Trigger budget alerts for new transaction
          if (newTx.type === 'expense') {
            const mStr = `${newTx.date.getFullYear()}-${String(newTx.date.getMonth() + 1).padStart(2, '0')}`;
            await checkBudgetExceeded(userId, newTx.category, mStr);
          }
        }

        // Advance nextDate
        if (interval === 'weekly') {
          nextDate.setDate(nextDate.getDate() + 7);
        } else if (interval === 'monthly') {
          nextDate.setMonth(nextDate.getMonth() + 1);
        } else if (interval === 'yearly') {
          nextDate.setFullYear(nextDate.getFullYear() + 1);
        }
      }
    }
  } catch (error) {
    console.error('Error running recurring scheduler:', error);
  }
};

// @desc    Get all transactions with search, category, date filters, and pagination
// @route   GET /api/transactions
// @access  Private
export const getTransactions = async (req, res, next) => {
  try {
    // Process recurring items first
    await processRecurringTransactions(req.user._id);

    const { search, category, type, startDate, endDate, page = 1, limit = 10 } = req.query;

    const query = { user: req.user._id };

    // Search query
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    // Category filter
    if (category && category !== 'All') {
      query.category = category;
    }

    // Type filter
    if (type && type !== 'All') {
      query.type = type;
    }

    // Date range filter
    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        query.date.$gte = new Date(startDate);
      }
      if (endDate) {
        // Set end date to end of the day
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    }

    const count = await Transaction.countDocuments(query);
    const pages = Math.ceil(count / limit);
    const skip = (page - 1) * limit;

    const transactions = await Transaction.find(query)
      .sort({ date: -1, createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      data: transactions,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        pages,
        total: count,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get transaction by ID
// @route   GET /api/transactions/:id
// @access  Private
export const getTransactionById = async (req, res, next) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!transaction) {
      res.status(404);
      throw new Error('Transaction not found');
    }

    res.json({ success: true, data: transaction });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a transaction
// @route   POST /api/transactions
// @access  Private
export const createTransaction = async (req, res, next) => {
  try {
    const { title, amount, type, category, date, description, isRecurring, recurringInterval } = req.body;

    const transaction = await Transaction.create({
      user: req.user._id,
      title,
      amount: Number(amount),
      type,
      category,
      date: date ? new Date(date) : new Date(),
      description,
      isRecurring: isRecurring || false,
      recurringInterval: recurringInterval || 'none',
    });

    // Check budget warnings
    if (type === 'expense') {
      const txDate = new Date(transaction.date);
      const mStr = `${txDate.getFullYear()}-${String(txDate.getMonth() + 1).padStart(2, '0')}`;
      await checkBudgetExceeded(req.user._id, category, mStr);
    }

    res.status(201).json({ success: true, data: transaction });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a transaction
// @route   PUT /api/transactions/:id
// @access  Private
export const updateTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!transaction) {
      res.status(404);
      throw new Error('Transaction not found');
    }

    const { title, amount, type, category, date, description, isRecurring, recurringInterval } = req.body;

    transaction.title = title || transaction.title;
    transaction.amount = amount !== undefined ? Number(amount) : transaction.amount;
    transaction.type = type || transaction.type;
    transaction.category = category || transaction.category;
    transaction.date = date ? new Date(date) : transaction.date;
    transaction.description = description !== undefined ? description : transaction.description;
    transaction.isRecurring = isRecurring !== undefined ? isRecurring : transaction.isRecurring;
    transaction.recurringInterval = recurringInterval || transaction.recurringInterval;

    const updatedTransaction = await transaction.save();

    // Check budget warnings
    if (updatedTransaction.type === 'expense') {
      const txDate = new Date(updatedTransaction.date);
      const mStr = `${txDate.getFullYear()}-${String(txDate.getMonth() + 1).padStart(2, '0')}`;
      await checkBudgetExceeded(req.user._id, updatedTransaction.category, mStr);
    }

    res.json({ success: true, data: updatedTransaction });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a transaction
// @route   DELETE /api/transactions/:id
// @access  Private
export const deleteTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!transaction) {
      res.status(404);
      throw new Error('Transaction not found');
    }

    res.json({ success: true, message: 'Transaction removed' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get dashboard metrics & trends charts
// @route   GET /api/transactions/stats
// @access  Private
export const getTransactionStats = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Aggregate total income and expense
    const totals = await Transaction.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
        },
      },
    ]);

    let totalIncome = 0;
    let totalExpense = 0;

    totals.forEach((item) => {
      if (item._id === 'income') {
        totalIncome = item.total;
      } else if (item._id === 'expense') {
        totalExpense = item.total;
      }
    });

    const totalBalance = totalIncome - totalExpense;

    // Aggregate category-wise expenses
    const categoryTotals = await Transaction.aggregate([
      { $match: { user: userId, type: 'expense' } },
      {
        $group: {
          _id: '$category',
          value: { $sum: '$amount' },
        },
      },
      { $project: { name: '$_id', value: 1, _id: 0 } },
    ]);

    // Aggregate monthly statistics (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyStats = await Transaction.aggregate([
      {
        $match: {
          user: userId,
          date: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
            type: '$type',
          },
          total: { $sum: '$amount' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Format monthly data for front-end charts: [{ month: 'Jan', income: 400, expense: 240 }]
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyDataMap = {};

    monthlyStats.forEach((stat) => {
      const key = `${stat._id.year}-${String(stat._id.month).padStart(2, '0')}`;
      if (!monthlyDataMap[key]) {
        monthlyDataMap[key] = {
          name: `${monthNames[stat._id.month - 1]} ${String(stat._id.year).slice(-2)}`,
          income: 0,
          expense: 0,
        };
      }
      if (stat._id.type === 'income') {
        monthlyDataMap[key].income = stat.total;
      } else {
        monthlyDataMap[key].expense = stat.total;
      }
    });

    const monthlyData = Object.values(monthlyDataMap);

    // Get recent transactions (last 5)
    const recentTransactions = await Transaction.find({ user: userId })
      .sort({ date: -1, createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      data: {
        totalBalance,
        totalIncome,
        totalExpense,
        categoryTotals,
        monthlyData,
        recentTransactions,
      },
    });
  } catch (error) {
    next(error);
  }
};
