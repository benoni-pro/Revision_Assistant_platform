import express from 'express';
import axios from 'axios';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Temporary controller functions
const getResources = (req, res) => {
  res.json({ message: 'Get resources - Coming soon!' });
};

const uploadResource = (req, res) => {
  res.json({ message: 'Upload resource - Coming soon!' });
};

// Routes
router.get('/', protect, getResources);
router.post('/', protect, uploadResource);

// RapidAPI: Balancing Studies proxy
router.get('/balancing-studies', protect, async (req, res) => {
  try {
    const apiKey = process.env.RAPIDAPI_BALANCING_STUDIES_KEY || process.env.RAPIDAPI_KEY;
    if (!apiKey) {
      return res.status(500).json({ success: false, message: 'Missing RAPIDAPI_BALANCING_STUDIES_KEY' });
    }

    // Forward optional path and query to RapidAPI
    const { path = '', ...query } = req.query || {};
    const url = `https://balancing-studies.p.rapidapi.com/${String(path).replace(/^\//, '')}`;

    const response = await axios.get(url, {
      params: query,
      headers: {
        'x-rapidapi-host': 'balancing-studies.p.rapidapi.com',
        'x-rapidapi-key': apiKey
      },
      timeout: 15000
    });

    return res.json({ success: true, data: response.data });
  } catch (error) {
    const status = error.response?.status || 502;
    const message = error.response?.data?.message || error.message || 'Upstream API error';
    return res.status(status).json({ success: false, message });
  }
});

export default router;
