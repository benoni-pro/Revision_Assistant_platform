import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import OpenAI from 'openai';

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

const getInstantFeedback = async (req, res) => {
  const { text } = req.body || {};
  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    return res.status(400).json({ success: false, message: 'Text is required' });
  }

  try {
    if (!process.env.OPENAI_API_KEY) throw new Error('Missing OPENAI_API_KEY');
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const prompt = `Provide concise writing feedback for the following student draft. Return JSON with keys sentenceFeedback (array of brief suggestions) and holisticFeedback (one paragraph). Draft:\n\n${text}`;
    const completion = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
    });
    const content = completion.choices?.[0]?.message?.content || '';
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
router.get('/analysis', protect, getAIAnalysis);
router.post('/recommendations', protect, generateRecommendations);
router.post('/feedback', protect, getInstantFeedback);
router.post('/outline', protect, getOutline);
router.get('/prompts', protect, getGenrePrompts);
router.get('/teacher-overview', protect, authorize('teacher', 'manager', 'admin'), getTeacherOverview);

export default router;
