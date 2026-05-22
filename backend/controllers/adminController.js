import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import Budget from '../models/Budget.js';
import SavingsGoal from '../models/SavingsGoal.js';
import { activityLogs } from '../middleware/logMiddleware.js';

// @desc    Get all users (Admin only)
// @route   GET /api/admin/users
// @access  Private/Admin
export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
};

// @desc    Get system-wide metrics (Admin only)
// @route   GET /api/admin/stats
// @access  Private/Admin
export const getSystemStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments({});
    const totalTransactions = await Transaction.countDocuments({});
    
    // Calculate global metrics
    const financialStats = await Transaction.aggregate([
      {
        $group: {
          _id: '$type',
          totalAmount: { $sum: '$amount' },
        },
      },
    ]);

    let globalIncome = 0;
    let globalExpense = 0;

    financialStats.forEach((stat) => {
      if (stat._id === 'income') {
        globalIncome = stat.totalAmount;
      } else if (stat._id === 'expense') {
        globalExpense = stat.totalAmount;
      }
    });

    const activeBudgets = await Budget.countDocuments({});
    const activeSavingsGoals = await SavingsGoal.countDocuments({});

    res.json({
      success: true,
      data: {
        totalUsers,
        totalTransactions,
        globalIncome,
        globalExpense,
        globalNet: globalIncome - globalExpense,
        activeBudgets,
        activeSavingsGoals,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get system activity logs (Admin only)
// @route   GET /api/admin/logs
// @access  Private/Admin
export const getActivityLogs = async (req, res, next) => {
  try {
    res.json({ success: true, data: activityLogs });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a user and all their associated records (Admin only)
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
export const deleteUser = async (req, res, next) => {
  try {
    const userId = req.params.id;

    // Prevent deleting oneself
    if (userId.toString() === req.user._id.toString()) {
      res.status(400);
      throw new Error('You cannot delete your own admin account');
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    // Remove user records
    await User.findByIdAndDelete(userId);
    await Transaction.deleteMany({ user: userId });
    await Budget.deleteMany({ user: userId });
    await SavingsGoal.deleteMany({ user: userId });

    res.json({ success: true, message: 'User and all related records deleted successfully' });
  } catch (error) {
    next(error);
  }
};
