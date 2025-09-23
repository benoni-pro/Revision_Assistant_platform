import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import OpenAI from 'openai';
import axios from 'axios';

const router = express.Router();

// Ollama/OpenAI helpers
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

// Core endpoints
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
        model: ollama.available ? (process.env.OLLAMA_MODEL || (ollama.models[0] || 'mistral:latest')) : (process.env.OPENAI_MODEL || 'gpt-4o-mini')
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
      const selectedModel = model || process.env.OLLAMA_MODEL || ollamaInfo.models[0] || 'mistral:latest';
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

    let data;
    try { data = JSON.parse(content); } catch {
      data = { sentenceFeedback: [], holisticFeedback: content };
    }
    return res.json({ success: true, message: 'Instant feedback', data });
  } catch (err) {
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
  res.json({ success: true, message: 'Teacher overview', data: {
    classes: 3,
    students: 92,
    avgWritingScore: 76,
    atRisk: 12,
    commonIssues: ['Organization', 'Evidence integration']
  }});
};

// Additional AI feature endpoints (mock implementations)
router.post('/generate-quiz', protect, async (req, res) => {
  try {
    const { subject, topic, level, questionCount, questionTypes, difficulty } = req.body;
    if (!subject || !topic) {
      return res.status(400).json({ success: false, message: 'Subject and topic are required' });
    }
    const mockQuiz = {
      title: `${subject} - ${topic} Quiz`,
      description: `A ${level} level quiz about ${topic}`,
      subject,
      topic,
      level,
      difficulty,
      questions: [
        {
          id: 1,
          type: 'multiple_choice',
          question: `What is the main concept in ${topic}?`,
          options: ['Option A', 'Option B', 'Option C', 'Option D'],
          correctAnswer: 'Option A',
          explanation: `This is the correct answer because...`,
          points: 1
        }
      ],
      totalPoints: questionCount,
      timeLimit: 30,
      createdBy: req.user._id,
      aiGenerated: true
    };
    res.json({ success: true, message: 'Quiz generated successfully', data: mockQuiz });
  } catch (error) {
    console.error('Quiz generation error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate quiz' });
  }
});

router.post('/generate-study-guide', protect, async (req, res) => {
  try {
    const { subject, topic, level, format, focusAreas } = req.body;
    if (!subject || !topic) {
      return res.status(400).json({ success: false, message: 'Subject and topic are required' });
    }
    const mockGuide = {
      title: `${subject} - ${topic} Study Guide`,
      subject,
      topic,
      level,
      format,
      content: {
        overview: `This study guide covers the essential concepts of ${topic} in ${subject}.`,
        keyConcepts: [
          'Concept 1: Definition and importance',
          'Concept 2: Applications and examples',
          'Concept 3: Common misconceptions'
        ],
        examples: [
          'Example 1 with detailed explanation',
          'Example 2 with step-by-step solution'
        ],
        practiceProblems: [
          'Problem 1: Basic level',
          'Problem 2: Intermediate level',
          'Problem 3: Advanced level'
        ],
        studyTips: [
          'Focus on understanding the fundamentals',
          'Practice regularly with different types of problems',
          'Review and reinforce your learning'
        ]
      },
      generatedAt: new Date(),
      generatedBy: req.user._id
    };
    res.json({ success: true, message: 'Study guide generated successfully', data: mockGuide });
  } catch (error) {
    console.error('Study guide generation error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate study guide' });
  }
});

router.post('/explain-concept', protect, async (req, res) => {
  try {
    const { concept, subject, level, context } = req.body;
    if (!concept || !subject) {
      return res.status(400).json({ success: false, message: 'Concept and subject are required' });
    }
    const mockExplanation = {
      concept,
      subject,
      level,
      context,
      explanation: {
        definition: `${concept} is a fundamental concept in ${subject} that...`,
        keyPoints: ['Point 1: Core understanding', 'Point 2: Practical applications', 'Point 3: Related concepts'],
        examples: ['Real-world example 1', 'Real-world example 2'],
        commonMisconceptions: ["Misconception 1 and why it's wrong", 'Misconception 2 and the correct understanding'],
        furtherReading: ['Resource 1 for deeper understanding', 'Resource 2 for practical applications']
      },
      generatedAt: new Date(),
      generatedBy: req.user._id
    };
    res.json({ success: true, message: 'Concept explanation generated successfully', data: mockExplanation });
  } catch (error) {
    console.error('Concept explanation error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate concept explanation' });
  }
});

router.post('/generate-study-plan', protect, async (req, res) => {
  try {
    const { subjects, timeAvailable, goals, deadline, currentLevel } = req.body;
    if (!subjects || !goals) {
      return res.status(400).json({ success: false, message: 'Subjects and goals are required' });
    }
    const subjectsArray = Array.isArray(subjects) ? subjects : String(subjects).split(',').map(s => s.trim());
    const goalsArray = Array.isArray(goals) ? goals : String(goals).split(',').map(s => s.trim());
    const mockPlan = {
      title: 'Personalized Study Plan',
      subjects: subjectsArray,
      timeAvailable,
      goals: goalsArray,
      deadline,
      currentLevel,
      plan: {
        weeklySchedule: {
          monday: { subjects: ['Subject 1'], duration: 2, activities: ['Reading', 'Practice'] },
          tuesday: { subjects: ['Subject 2'], duration: 1.5, activities: ['Video lessons', 'Quiz'] },
          wednesday: { subjects: ['Subject 1', 'Subject 3'], duration: 2.5, activities: ['Study group', 'Review'] },
          thursday: { subjects: ['Subject 2'], duration: 2, activities: ['Practice problems', 'Flashcards'] },
          friday: { subjects: ['Subject 3'], duration: 1.5, activities: ['Project work', 'Research'] },
          saturday: { subjects: ['All subjects'], duration: 3, activities: ['Review', 'Practice tests'] },
          sunday: { subjects: ['Weak areas'], duration: 2, activities: ['Focused study', 'Preparation'] }
        },
        milestones: [
          { week: 1, goal: 'Complete basic concepts', subjects: ['Subject 1'] },
          { week: 2, goal: 'Practice and reinforce', subjects: ['Subject 1', 'Subject 2'] },
          { week: 3, goal: 'Advanced topics', subjects: ['Subject 2', 'Subject 3'] },
          { week: 4, goal: 'Review and assessment', subjects: ['All subjects'] }
        ],
        studyTechniques: ['Active recall', 'Spaced repetition', 'Practice testing', 'Interleaving'],
        resources: ['Textbook chapters 1-5', 'Online video series', 'Practice problem sets', 'Study group discussions']
      },
      generatedAt: new Date(),
      generatedBy: req.user._id
    };
    res.json({ success: true, message: 'Study plan generated successfully', data: mockPlan });
  } catch (error) {
    console.error('Study plan generation error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate study plan' });
  }
});

router.post('/analyze-progress', protect, async (req, res) => {
  try {
    const { subject, scores, topics } = req.body;
    const avg = Array.isArray(scores) && scores.length > 0 ? (scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
    const mockAnalytics = {
      subject,
      overallPerformance: { averageScore: avg, trend: 'improving', consistency: 'good' },
      topicAnalysis: (Array.isArray(topics) ? topics : []).map(topic => ({
        topic,
        performance: Math.round(Math.random() * 100),
        recommendations: ['Focus on practice problems', 'Review key concepts']
      })),
      recommendations: [
        'Continue with current study schedule',
        'Focus more on weak areas',
        'Increase practice frequency for better retention'
      ],
      nextSteps: [
        'Complete practice quiz on weak topics',
        'Join study group for collaborative learning',
        'Schedule regular review sessions'
      ],
      generatedAt: new Date(),
      generatedBy: req.user?._id
    };
    res.json({ success: true, message: 'Progress analysis completed', data: mockAnalytics });
  } catch (error) {
    console.error('Progress analysis error:', error);
    res.status(500).json({ success: false, message: 'Failed to analyze progress' });
  }
});

// Bind routes
router.get('/models', protect, getModels);
router.get('/analysis', protect, getAIAnalysis);
router.post('/recommendations', protect, generateRecommendations);
router.post('/feedback', protect, getInstantFeedback);
router.post('/outline', protect, getOutline);
router.get('/prompts', protect, getGenrePrompts);
router.get('/teacher-overview', protect, authorize('teacher', 'manager', 'admin'), getTeacherOverview);

export default router;

