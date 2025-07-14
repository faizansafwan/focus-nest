import dotenv from 'dotenv';
dotenv.config();

import User from '../models/User.js';
import OpenAI from 'openai';
const token = process.env.GITHUB_TOKEN;
const endpoint = 'https://models.github.ai/inference';
const model = 'openai/gpt-4.1';


console.log(process.env.GITHUB_TOKEN);
const client = new OpenAI({ baseURL: endpoint, apiKey: token });

// @desc    Recommend a focus slot for a task using OpenAI
// @route   POST /api/tasks/schedule
// @access  Private
export const getFocusSlotRecommendation = async (req, res) => {
  const { title, cognitiveLoad } = req.body;

  if (!title || !cognitiveLoad) {
    return res
      .status(400)
      .json({ message: 'Title and cognitiveLoad are required' });
  }

  try {
    const user = await User.findById(req.user._id);
    const focusPeaks = user.focusPeaks;

    if (!focusPeaks || focusPeaks.length === 0) {
      return res
        .status(400)
        .json({ message: 'User has not set focus preferences yet.' });
    }

    const prompt = `
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
      `;

    
    const result = await client.chat.completions.create({
      messages: [
        { role:"system", content: "You are a helpful assistant." },
        { role:"user", content: prompt }
      ],
      temperature: 1.0,
      top_p: 1.0,
      model: model
    });

    console.log();

    const responseText = result.choices[0].message.content.trim();
    const [slotLine, reasonLine] = responseText.split('\n').map(line => line.trim());
    const suggestedFocusSlot = slotLine.replace('Focus Slot: ', '');
    const reason = reasonLine?.replace('Reason: ', '');

    res.json({ suggestedFocusSlot, reason });

  } catch (error) {
    console.error(error.response?.data || error.message);
    res
      .status(500)
      .json({ message: 'AI scheduling failed', error: error.message });
  }
};


// @desc    Use OpenAI to calculate cognitive load
// @route   POST /api/ai/cognitive-load
// @access  Private
export const getCognitiveLoad = async (req, res) => {
  const { title, description } = req.body;

  if (!title && !description) {
    return res.status(400).json({ message: 'Title or description is required' });
  }

  const prompt = `
    You are a productivity expert. Based on the task title and description, classify the cognitive load as "Low", "Medium", or "High".

    Examples:
    - Writing an article = High
    - Reading emails = Low
    - Reviewing a pull request = Medium

    Respond with only the label.

    Task Title: "${title}"
    Task Description: "${description}"
    Cognitive Load:
  `;

  try {
    const result = await client.chat.completions.create({
      model: model,
      messages: [
        { role: 'system', content: 'You are a productivity assistant.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
    });

    const output = result.choices[0].message.content.trim();
    res.json({ cognitiveLoad: output });
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ message: 'OpenAI request failed', error: error.message });
  }
};

