import express from 'express';
import { getFocusSlotRecommendation } from '../controllers/aiController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/schedule', protect, getFocusSlotRecommendation);

export default router;
