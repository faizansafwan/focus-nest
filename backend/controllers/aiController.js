import dotenv from 'dotenv';
import User from '../models/User.js';
import OpenAI from 'openai';
const token = process.env.GITHUB_TOKEN;
const endpoint = 'https://models.github.ai/inference';
const model = 'openai/gpt-4.1';

dotenv.config();

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
You are a productivity assistant. Based on the following user focus slots and task, suggest the best time block for deep work.

User's Focus Peaks: ${focusPeaks.join(', ')}
Task: ${title}
Cognitive Load: ${cognitiveLoad}

Which focus slot is best for this task? Respond with just one of the user's focus slots.
`;
    console.log('GITHUB_TOKEN:', process.env.GITHUB_TOKEN);
    const client = new OpenAI({ baseURL: endpoint, apiKey: token });

    const result = await client.chat.completions.create({
      model: 'openai/gpt-4.1',
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.5,
    });

    const output = result.choices[0].message.content.trim();
    res.json({ suggestedFocusSlot: output });
  } catch (error) {
    console.error(error.response?.data || error.message);
    res
      .status(500)
      .json({ message: 'AI scheduling failed', error: error.message });
  }
};
