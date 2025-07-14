const Task = require('../models/Task');

// @desc    Get all tasks for logged-in user with pagination
// @route   GET /api/tasks?page=1&limit=10
// @access  Private
const getTasks = async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;       // Default to page 1
      const limit = parseInt(req.query.limit) || 10;     // Default to 10 per page
      const skip = (page - 1) * limit;
  
      const totalTasks = await Task.countDocuments({ userId: req.user._id });
      const tasks = await Task.find({ userId: req.user._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
  
      res.json({
        currentPage: page,
        totalPages: Math.ceil(totalTasks / limit),
        totalTasks,
        tasks,
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
};
  

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private
const createTask = async (req, res) => {
  const {
    title,
    description,
    startDate,
    endDate,
    dueDate,
    priority,
    status,
    focusSlot,
    cognitiveLoad,
    rescheduleCount,
  } = req.body;

  if (!title) {
    return res.status(400).json({ message: 'Title is required' });
  }

  try {
    const task = new Task({
      userId: req.user._id,
      title,
      description,
      startDate,
      endDate,
      dueDate,
      priority,
      status,
      focusSlot,
      cognitiveLoad,
      rescheduleCount,
    });

    const savedTask = await task.save();
    res.status(201).json(savedTask);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update a task
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res) => {
  const taskId = req.params.id;

  try {
    const task = await Task.findOne({ _id: taskId, userId: req.user._id });
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const updates = [
      'title',
      'description',
      'startDate',
      'endDate',
      'dueDate',
      'priority',
      'status',
      'focusSlot',
      'cognitiveLoad',
      'rescheduleCount',
    ];

    updates.forEach((field) => {
      if (req.body[field] !== undefined) {
        task[field] = req.body[field];
      }
    });

    const updatedTask = await task.save();
    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = async (req, res) => {
  const taskId = req.params.id;

  try {
    const task = await Task.findOneAndDelete({
      _id: taskId,
      userId: req.user._id,
    });
    if (!task) {
      return res
        .status(404)
        .json({ message: 'Task not found or already deleted' });
    }
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get a single task by ID
// @route   GET /api/task/:id
// @access  Private
const getTaskById = async (req, res) => {
    const taskId = req.params.id;
  
    try {
      const task = await Task.findOne({ _id: taskId, userId: req.user._id });
  
      if (!task) {
        return res.status(404).json({ message: 'Task not found' });
      }
  
      res.json(task);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  };
  
  module.exports = {
    getTasks,
    createTask,
    updateTask,
    deleteTask,
    getTaskById, 
  };
  
