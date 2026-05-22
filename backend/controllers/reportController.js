import Report from '../models/Report.js';
import Transaction from '../models/Transaction.js';

// @desc    Get user report statements history
// @route   GET /api/reports
// @access  Private
export const getReports = async (req, res, next) => {
  try {
    const reports = await Report.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: reports });
  } catch (error) {
    next(error);
  }
};

// @desc    Compile a report metadata record for a specific month
// @route   POST /api/reports
// @access  Private
export const compileReport = async (req, res, next) => {
  try {
    const { month } = req.body; // e.g. "2026-05"
    if (!month) {
      res.status(400);
      throw new Error('Please specify a month in YYYY-MM format');
    }

    const startOfMonth = new Date(`${month}-01T00:00:00.000Z`);
    const endOfMonth = new Date(startOfMonth.getFullYear(), startOfMonth.getMonth() + 1, 0, 23, 59, 59, 999);

    // Aggregate income/expense totals for this month
    const stats = await Transaction.aggregate([
      {
        $match: {
          user: req.user._id,
          date: { $gte: startOfMonth, $lte: endOfMonth },
        },
      },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
        },
      },
    ]);

    let totalIncome = 0;
    let totalExpense = 0;

    stats.forEach((item) => {
      if (item._id === 'income') {
        totalIncome = item.total;
      } else if (item._id === 'expense') {
        totalExpense = item.total;
      }
    });

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const [yearPart, monthPart] = month.split('-');
    const monthName = monthNames[parseInt(monthPart) - 1];

    const reportName = `Financial Statement - ${monthName} ${yearPart}`;

    // Upsert report statement metadata
    const report = await Report.findOneAndUpdate(
      { user: req.user._id, month },
      {
        name: reportName,
        totalIncome,
        totalExpense,
        status: 'completed',
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.status(201).json({ success: true, data: report });
  } catch (error) {
    next(error);
  }
};
