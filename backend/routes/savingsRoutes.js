import express from 'express';
import {
  getSavingsGoals,
  createSavingsGoal,
  updateSavingsGoal,
  addFundsToGoal,
  deleteSavingsGoal,
} from '../controllers/savingsController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').get(protect, getSavingsGoals).post(protect, createSavingsGoal);
router
  .route('/:id')
  .put(protect, updateSavingsGoal)
  .delete(protect, deleteSavingsGoal);
router.route('/:id/funds').post(protect, addFundsToGoal);

export default router;
