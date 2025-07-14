import express from 'express';
import {
  updateFocusPreferences,
  getCurrentUser,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply auth middleware
router.use(protect);

// Routes
router.put('/preferences', updateFocusPreferences);
router.get('/me', getCurrentUser);

export default router;
