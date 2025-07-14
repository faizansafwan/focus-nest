import express from 'express';
import { getCognitiveLoad, getFocusSlotRecommendation } from '../controllers/aiController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/schedule', protect, getFocusSlotRecommendation);
router.post('/cognitive-load', protect, getCognitiveLoad);

export default router;
