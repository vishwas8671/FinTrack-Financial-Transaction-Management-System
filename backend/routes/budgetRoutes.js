import express from 'express';
import {
  getBudgets,
  createOrUpdateBudget,
  deleteBudget,
} from '../controllers/budgetController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').get(protect, getBudgets).post(protect, createOrUpdateBudget);
router.route('/:id').delete(protect, deleteBudget);

export default router;
