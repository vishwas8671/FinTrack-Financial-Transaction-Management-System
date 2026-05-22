import SavingsGoal from '../models/SavingsGoal.js';
import Notification from '../models/Notification.js';

// @desc    Get all savings goals
// @route   GET /api/savings
// @access  Private
export const getSavingsGoals = async (req, res, next) => {
  try {
    const goals = await SavingsGoal.find({ user: req.user._id });
    res.json({ success: true, data: goals });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a savings goal
// @route   POST /api/savings
// @access  Private
export const createSavingsGoal = async (req, res, next) => {
  try {
    const { name, targetAmount, targetDate } = req.body;

    const goal = await SavingsGoal.create({
      user: req.user._id,
      name,
      targetAmount: Number(targetAmount),
      targetDate: new Date(targetDate),
    });

    res.status(201).json({ success: true, data: goal });
  } catch (error) {
    next(error);
  }
};

// @desc    Update savings goal details
// @route   PUT /api/savings/:id
// @access  Private
export const updateSavingsGoal = async (req, res, next) => {
  try {
    const goal = await SavingsGoal.findOne({ _id: req.params.id, user: req.user._id });

    if (!goal) {
      res.status(404);
      throw new Error('Savings goal not found');
    }

    goal.name = req.body.name || goal.name;
    goal.targetAmount = req.body.targetAmount ? Number(req.body.targetAmount) : goal.targetAmount;
    goal.targetDate = req.body.targetDate ? new Date(req.body.targetDate) : goal.targetDate;
    
    if (req.body.status) {
      goal.status = req.body.status;
    }

    const updatedGoal = await goal.save();
    res.json({ success: true, data: updatedGoal });
  } catch (error) {
    next(error);
  }
};

// @desc    Add or remove funds to/from a savings goal
// @route   POST /api/savings/:id/funds
// @access  Private
export const addFundsToGoal = async (req, res, next) => {
  try {
    const goal = await SavingsGoal.findOne({ _id: req.params.id, user: req.user._id });

    if (!goal) {
      res.status(404);
      throw new Error('Savings goal not found');
    }

    const { amount } = req.body; // positive to deposit, negative to withdraw
    if (amount === undefined || isNaN(amount)) {
      res.status(400);
      throw new Error('Please provide a valid amount');
    }

    goal.currentAmount += Number(amount);
    
    // Prevent negative savings
    if (goal.currentAmount < 0) {
      goal.currentAmount = 0;
    }

    // Check completion status
    if (goal.currentAmount >= goal.targetAmount) {
      goal.status = 'completed';

      // Push notification
      const milestoneNotification = await Notification.findOne({
        user: req.user._id,
        type: 'milestone',
        title: `Goal Accomplished! - ${goal.name}`,
      });

      if (!milestoneNotification) {
        await Notification.create({
          user: req.user._id,
          title: `Goal Accomplished! - ${goal.name}`,
          message: `Hurrah! You have fully achieved your savings goal of $${goal.targetAmount.toFixed(2)} for "${goal.name}". Great work!`,
          type: 'milestone',
        });
      }
    } else {
      goal.status = 'active';
    }

    const updatedGoal = await goal.save();
    res.json({ success: true, data: updatedGoal });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a savings goal
// @route   DELETE /api/savings/:id
// @access  Private
export const deleteSavingsGoal = async (req, res, next) => {
  try {
    const goal = await SavingsGoal.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!goal) {
      res.status(404);
      throw new Error('Savings goal not found');
    }

    res.json({ success: true, message: 'Savings goal removed' });
  } catch (error) {
    next(error);
  }
};
