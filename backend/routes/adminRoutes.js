import express from 'express';
import {
  getAllUsers,
  getSystemStats,
  getActivityLogs,
  deleteUser,
} from '../controllers/adminController.js';
import { protect } from '../middleware/authMiddleware.js';
import { adminOnly } from '../middleware/adminMiddleware.js';

const router = express.Router();

// Apply auth protection & admin check to all admin routes
router.use(protect);
router.use(adminOnly);

router.route('/users').get(getAllUsers);
router.route('/stats').get(getSystemStats);
router.route('/logs').get(getActivityLogs);
router.route('/users/:id').delete(deleteUser);

export default router;
