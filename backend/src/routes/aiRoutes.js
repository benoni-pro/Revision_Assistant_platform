import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import OpenAI from 'openai';
import axios from 'axios';

const router = express.Router();

// Mock/placeholder AI controllers (to be replaced with real ML integration)
const getAIAnalysis = (req, res) => {
  res.json({
    success: true,
    message: 'AI Analysis placeholder',
    data: {
      strengths: ['Clear thesis', 'Strong topic sentences'],
      weaknesses: ['Run-on sentences', 'Weak conclusion'],
      suggestions: ['Break long sentences', 'Add concluding synthesis']
    }
  });
};

const generateRecommendations = (req, res) => {
  res.json({ success: true, message: 'AI Recommendations placeholder', data: ['Practice outlines', 'Focus on cohesion'] });
};

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';

const fetchOllamaModels = async () => {
  try {
    const resp = await axios.get(`${OLLAMA_BASE_URL}/api/tags`, { timeout: 5000 });
    const models = Array.isArray(resp.data?.models) ? resp.data.models.map(m => m.name) : [];
    return { available: true, models };
  } catch (err) {
    return { available: false, models: [], error: err?.message };
  }
};

const generateWithOllama = async (model, prompt) => {
  const body = { model, prompt, stream: false, options: { temperature: 0.2 } };
  const resp = await axios.post(`${OLLAMA_BASE_URL}/api/generate`, body, { timeout: 30000 });
  return resp.data?.response || '';
};

const getModels = async (req, res) => {
  try {
    const ollama = await fetchOllamaModels();
    const openaiAvailable = !!process.env.OPENAI_API_KEY;
    const data = {
      providers: {
        ollama: { available: ollama.available, models: ollama.models },
        openai: { available: openaiAvailable, models: [] }
      },
      defaults: {
        provider: ollama.available ? 'ollama' : (openaiAvailable ? 'openai' : 'none'),
        model: ollama.available ? (process.env.OLLAMA_MODEL || (ollama.models[0] || 'llama3.1')) : (process.env.OPENAI_MODEL || 'gpt-4o-mini')
      }
    };
    return res.json({ success: true, message: 'AI providers and models', data });
  } catch (err) {
    return res.status(500).json({ success: false, message: err?.message || 'Failed to get models' });
  }
};

const getInstantFeedback = async (req, res) => {
  const { text, provider, model } = req.body || {};
  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    return res.status(400).json({ success: false, message: 'Text is required' });
  }

  try {
    const chosenProvider = provider || (process.env.OPENAI_API_KEY ? 'openai' : 'ollama');
    const prompt = `Provide concise writing feedback for the following student draft. Return JSON with keys sentenceFeedback (array of brief suggestions) and holisticFeedback (one paragraph). Draft:\n\n${text}`;
    let content = '';

    if (chosenProvider === 'ollama') {
      const ollamaInfo = await fetchOllamaModels();
      if (!ollamaInfo.available) throw new Error('Ollama is not available');
      const selectedModel = model || process.env.OLLAMA_MODEL || ollamaInfo.models[0] || 'llama3.1';
      content = await generateWithOllama(selectedModel, prompt);
    } else {
      if (!process.env.OPENAI_API_KEY) throw new Error('Missing OPENAI_API_KEY');
      const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const completion = await client.chat.completions.create({
        model: model || process.env.OPENAI_MODEL || 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
      });
      content = completion.choices?.[0]?.message?.content || '';
    }
    // Try to parse JSON; if not JSON, wrap as holistic
    let data;
    try { data = JSON.parse(content); } catch {
      data = { sentenceFeedback: [], holisticFeedback: content };
    }
    return res.json({ success: true, message: 'Instant feedback', data });
  } catch (err) {
    // Fallback heuristic
    const length = (text || '').length;
    const issues = [];
    if (length < 30) issues.push('Your writing is very short; add more detail.');
    if ((text || '').split(',').length > 5) issues.push('Consider splitting long sentences to improve readability.');
    return res.json({ success: true, message: 'Instant feedback (fallback)', data: {
      sentenceFeedback: issues,
      holisticFeedback: length > 200 ? 'Good development. Consider refining transitions.' : 'Needs more development and clearer structure.'
    }});
  }
};

const getOutline = (req, res) => {
  const { topic } = req.body || {};
  res.json({ success: true, message: 'Outline generated', data: {
    thesis: `Thesis about ${topic || 'your topic'}`,
    sections: [
      { heading: 'Introduction', bullets: ['Hook', 'Context', 'Thesis'] },
      { heading: 'Body Paragraph 1', bullets: ['Topic sentence', 'Evidence', 'Analysis'] },
      { heading: 'Body Paragraph 2', bullets: ['Topic sentence', 'Evidence', 'Analysis'] },
      { heading: 'Conclusion', bullets: ['Summary', 'Implications', 'Closing thought'] }
    ]
  }});
};

const getGenrePrompts = (req, res) => {
  const { genre } = req.query;
  const prompts = {
    argumentative: ['Argue for or against school uniforms.', 'Should homework be limited?'],
    narrative: ['Write about a time you overcame a challenge.', 'Tell a story about an unexpected journey.'],
    informative: ['Explain how photosynthesis works.', 'Describe the impact of social media on communication.']
  };
  res.json({ success: true, message: 'Genre prompts', data: { prompts: prompts[genre] || prompts.argumentative } });
};

const getTeacherOverview = (req, res) => {
  // Would query aggregated progress/assessment data
  res.json({ success: true, message: 'Teacher overview', data: {
    classes: 3,
    students: 92,
    avgWritingScore: 76,
    atRisk: 12,
    commonIssues: ['Organization', 'Evidence integration']
  }});
};

// Routes
router.get('/models', protect, getModels);
router.get('/analysis', protect, getAIAnalysis);
router.post('/recommendations', protect, generateRecommendations);
router.post('/feedback', protect, getInstantFeedback);
router.post('/outline', protect, getOutline);
router.get('/prompts', protect, getGenrePrompts);
router.get('/teacher-overview', protect, authorize('teacher', 'manager', 'admin'), getTeacherOverview);

export default router;
