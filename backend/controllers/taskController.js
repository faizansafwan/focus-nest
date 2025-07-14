import Task from '../models/Task.js';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import User from '../models/User.js';
dotenv.config();


const token = process.env.GITHUB_TOKEN;
const endpoint = 'https://models.github.ai/inference';
const model = 'openai/gpt-4.1';


console.log(process.env.GITHUB_TOKEN);
const openaiClient = new OpenAI({ baseURL: endpoint, apiKey: token });

// @desc    Get all tasks for logged-in user with pagination
// @route   GET /api/tasks?page=1&limit=10
// @access  Private
export const getTasks = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Default to page 1
    const limit = parseInt(req.query.limit) || 10; // Default to 10 per page
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



export const createTask = async (req, res) => {
  let {
    title,
    description,
    startDate,
    endDate,
    dueDate,
    priority,
    status,
    focusSlot, // will be auto-filled if not provided
    cognitiveLoad,
    rescheduleCount,
  } = req.body;

  if (!title) {
    return res.status(400).json({ message: 'Title is required' });
  }

  try {
    // Auto-detect cognitiveLoad if not provided
    if (!cognitiveLoad) {
      const loadPrompt = `
You are a productivity expert. Based on the task title and description, classify the cognitive load as "Low", "Medium", or "High".

Examples:
- Writing an article = High
- Reading emails = Low
- Reviewing a pull request = Medium

Respond with only the label.

Task Title: "${title}"
Task Description: "${description}"
Cognitive Load:`.trim();

      const loadResult = await openaiClient.chat.completions.create({
        model,
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: loadPrompt },
        ],
        temperature: 0.3,
      });

      const rawLoad = loadResult.choices[0].message.content.trim();
      const loadMatch = rawLoad.match(/\b(Low|Medium|High)\b/i);
      cognitiveLoad = loadMatch ? loadMatch[0] : 'Medium';
    }

    // Auto-assign focusSlot if not provided
    if (!focusSlot) {
      const user = await User.findById(req.user._id);
      const focusPeaks = user?.focusPeaks || [];

      if (focusPeaks.length > 0) {
        const slotPrompt = `
You are a productivity assistant. Based on the user's focus time preferences and the task description, suggest the best time block for doing deep work. 

Provide:
1. The recommended focus slot (from the user's focus peaks),
2. A short reason why that slot is ideal based on energy levels or cognitive load.

User's Focus Peaks: ${focusPeaks.join(', ')}
Task: ${title}
Cognitive Load: ${cognitiveLoad}

Respond in this format:
Focus Slot: <recommended slot>
Reason: <brief explanation>
`.trim();

        const slotResult = await openaiClient.chat.completions.create({
          model,
          messages: [
            { role: 'system', content: 'You are a helpful assistant.' },
            { role: 'user', content: slotPrompt },
          ],
          temperature: 0.7,
        });

        const responseText = slotResult.choices[0].message.content.trim();
        const [slotLine] = responseText.split('\n');
        focusSlot = slotLine.replace('Focus Slot: ', '').trim();
      }
    }

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
    console.error(error.response?.data || error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


// @desc    Update a task
// @route   PUT /api/tasks/:id
// @access  Private
export const updateTask = async (req, res) => {
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
export const deleteTask = async (req, res) => {
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
export const getTaskById = async (req, res) => {
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
