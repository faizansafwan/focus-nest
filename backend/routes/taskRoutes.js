const express = require('express');
const router = express.Router();
const {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  getTaskById,
} = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');

// Protect all routes
router.use(protect);

// task routes
router.get('/', getTasks);
router.post('/', createTask);
router.get('/:id', getTaskById);     
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);

module.exports = router;
