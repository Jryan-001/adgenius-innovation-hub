/**
 * AI Routes
 * 
 * Proxy routes to AI Engine service.
 * This allows frontend to call backend, which then calls AI engine.
 */

import express from 'express';

const router = express.Router();

const AI_ENGINE_URL = process.env.AI_ENGINE_URL || 'http://localhost:3001';

/**
 * Helper to proxy requests to AI Engine
 */
async function proxyToAI(endpoint, body) {
    const response = await fetch(`${AI_ENGINE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });
    return response.json();
}

/**
 * Generate smart layout
 * POST /api/ai/generate-layout
 */
router.post('/generate-layout', async (req, res) => {
    try {
        const result = await proxyToAI('/api/ai/generate-layout', req.body);
        res.json(result);
    } catch (error) {
        console.error('AI layout error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Chat with AI
 * POST /api/ai/chat
 */
router.post('/chat', async (req, res) => {
    try {
        const result = await proxyToAI('/api/ai/chat', req.body);
        res.json(result);
    } catch (error) {
        console.error('AI chat error:', error);
        res.status(500).json({ error: error.message });
    }
});


/**
 * Generate copy (headlines, CTAs)
 * POST /api/ai/generate-copy
 */
router.post('/generate-copy', async (req, res) => {
    try {
        const result = await proxyToAI('/api/ai/generate-copy', req.body);
        res.json(result);
    } catch (error) {
        console.error('AI copy error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Check compliance
 * POST /api/ai/check-compliance
 */
router.post('/check-compliance', async (req, res) => {
    try {
        const result = await proxyToAI('/api/ai/check-compliance', req.body);
        res.json(result);
    } catch (error) {
        console.error('Compliance check error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Quick compliance check
 * POST /api/ai/quick-compliance
 */
router.post('/quick-compliance', async (req, res) => {
    try {
        const result = await proxyToAI('/api/ai/quick-compliance', req.body);
        res.json(result);
    } catch (error) {
        console.error('Quick compliance error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Generate complete ad
 * POST /api/ai/generate-ad
 */
router.post('/generate-ad', async (req, res) => {
    try {
        const result = await proxyToAI('/api/ai/generate-ad', req.body);
        res.json(result);
    } catch (error) {
        console.error('Ad generation error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Export formats
 * POST /api/ai/export-formats
 */
router.post('/export-formats', async (req, res) => {
    try {
        const result = await proxyToAI('/api/ai/export-formats', req.body);
        res.json(result);
    } catch (error) {
        console.error('Export error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Get available platforms
 * GET /api/ai/platforms
 */
router.get('/platforms', async (req, res) => {
    try {
        const response = await fetch(`${AI_ENGINE_URL}/api/ai/platforms`);
        const result = await response.json();
        res.json(result);
    } catch (error) {
        console.error('Platforms fetch error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Get brand guidelines
 * GET /api/ai/guidelines/:brand
 */
router.get('/guidelines/:brand', async (req, res) => {
    try {
        const response = await fetch(`${AI_ENGINE_URL}/api/ai/guidelines/${req.params.brand}`);
        const result = await response.json();
        res.json(result);
    } catch (error) {
        console.error('Guidelines fetch error:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
