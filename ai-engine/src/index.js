/**
 * AdGenius AI Engine - Main Entry Point
 * 
 * Express server exposing AI services as REST APIs.
 * This can be run standalone or integrated into the main backend.
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Import AI services
import { generateLayout, generateMultiPlatformLayouts, LAYOUT_TEMPLATES } from './services/layoutAgent.js';
import { generateCopy, generateCopyVariations, validateCopy, BRAND_VOICES } from './services/copyAgent.js';
import { checkCompliance, quickComplianceCheck, getAvailableGuidelines, BRAND_GUIDELINES } from './services/complianceAgent.js';
import { generateAllExports, generateCloudinaryUrl, getAvailablePlatforms, generateCompositeUrl } from './services/exportService.js';
import { analyzeImage, analyzePackshot, analyzeLogo, quickQualityCheck, suggestBackgroundTreatment } from './services/imageAnalysisAgent.js';
import { processChat, generateCreativeContent, getDesignFeedback, brainstorm } from './services/chatAgent.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Allow large base64 images

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        service: 'AdGenius AI Engine',
        version: '1.0.0',
        timestamp: new Date().toISOString()
    });
});

// ============================================
// LAYOUT GENERATION ENDPOINTS
// ============================================

/**
 * Generate smart ad layout
 * POST /api/ai/generate-layout
 */
app.post('/api/ai/generate-layout', async (req, res) => {
    try {
        const { brand, product, platform, brandAssets } = req.body;

        if (!brand || !product || !platform) {
            return res.status(400).json({
                error: 'Missing required fields: brand, product, platform'
            });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return res.status(500).json({
                error: 'GEMINI_API_KEY not configured'
            });
        }

        const result = await generateLayout({ brand, product, platform, brandAssets }, apiKey);
        res.json(result);

    } catch (error) {
        console.error('Layout generation error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Generate layouts for all platforms at once
 * POST /api/ai/generate-multi-layout
 */
app.post('/api/ai/generate-multi-layout', async (req, res) => {
    try {
        const { brand, product, brandAssets } = req.body;

        if (!brand || !product) {
            return res.status(400).json({
                error: 'Missing required fields: brand, product'
            });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return res.status(500).json({
                error: 'GEMINI_API_KEY not configured'
            });
        }

        const result = await generateMultiPlatformLayouts({ brand, product, brandAssets }, apiKey);
        res.json(result);

    } catch (error) {
        console.error('Multi-layout generation error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Get available layout templates
 * GET /api/ai/layout-templates
 */
app.get('/api/ai/layout-templates', (req, res) => {
    res.json({
        templates: LAYOUT_TEMPLATES,
        platforms: Object.keys(LAYOUT_TEMPLATES)
    });
});

// ============================================
// COPY GENERATION ENDPOINTS
// ============================================

/**
 * Generate ad copy (headlines, CTAs)
 * POST /api/ai/generate-copy
 */
app.post('/api/ai/generate-copy', async (req, res) => {
    try {
        const { brand, product, platform, productBenefits, campaignGoal } = req.body;

        if (!brand || !product || !platform) {
            return res.status(400).json({
                error: 'Missing required fields: brand, product, platform'
            });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return res.status(500).json({
                error: 'GEMINI_API_KEY not configured'
            });
        }

        const result = await generateCopy({ brand, product, platform, productBenefits, campaignGoal }, apiKey);
        res.json(result);

    } catch (error) {
        console.error('Copy generation error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Validate copy against brand guidelines
 * POST /api/ai/validate-copy
 */
app.post('/api/ai/validate-copy', (req, res) => {
    try {
        const { copy, brand } = req.body;

        if (!copy || !brand) {
            return res.status(400).json({
                error: 'Missing required fields: copy, brand'
            });
        }

        const result = validateCopy(copy, brand);
        res.json(result);

    } catch (error) {
        console.error('Copy validation error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Get available brand voices
 * GET /api/ai/brand-voices
 */
app.get('/api/ai/brand-voices', (req, res) => {
    res.json({
        brands: Object.keys(BRAND_VOICES),
        voices: BRAND_VOICES
    });
});

// ============================================
// COMPLIANCE ENDPOINTS
// ============================================

/**
 * Full compliance check using Vision AI
 * POST /api/ai/check-compliance
 */
app.post('/api/ai/check-compliance', async (req, res) => {
    try {
        const { canvasImage, brand, adMetadata } = req.body;

        if (!canvasImage || !brand) {
            return res.status(400).json({
                error: 'Missing required fields: canvasImage (base64 or URL), brand'
            });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return res.status(500).json({
                error: 'GEMINI_API_KEY not configured'
            });
        }

        const result = await checkCompliance({ canvasImage, brand, adMetadata }, apiKey);
        res.json(result);

    } catch (error) {
        console.error('Compliance check error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Quick compliance pre-check (lightweight)
 * POST /api/ai/quick-compliance
 */
app.post('/api/ai/quick-compliance', async (req, res) => {
    try {
        const { canvasData, brand } = req.body;

        if (!canvasData || !brand) {
            return res.status(400).json({
                error: 'Missing required fields: canvasData, brand'
            });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        const result = await quickComplianceCheck({ canvasData, brand }, apiKey);
        res.json(result);

    } catch (error) {
        console.error('Quick compliance check error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Get brand guidelines
 * GET /api/ai/guidelines/:brand
 */
app.get('/api/ai/guidelines/:brand', (req, res) => {
    const { brand } = req.params;
    const guidelines = getAvailableGuidelines(brand);
    res.json(guidelines);
});

/**
 * Get all available brand guidelines
 * GET /api/ai/guidelines
 */
app.get('/api/ai/guidelines', (req, res) => {
    res.json({
        brands: Object.keys(BRAND_GUIDELINES),
        guidelines: BRAND_GUIDELINES
    });
});

// ============================================
// EXPORT ENDPOINTS
// ============================================

/**
 * Generate export URLs for all platforms
 * POST /api/ai/export-formats
 */
app.post('/api/ai/export-formats', (req, res) => {
    try {
        const { imageUrl, platforms } = req.body;

        if (!imageUrl) {
            return res.status(400).json({
                error: 'Missing required field: imageUrl'
            });
        }

        const result = generateAllExports(imageUrl, platforms);
        res.json(result);

    } catch (error) {
        console.error('Export generation error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Generate composite ad with overlays
 * POST /api/ai/composite
 */
app.post('/api/ai/composite', (req, res) => {
    try {
        const { backgroundUrl, overlays, platform } = req.body;

        if (!backgroundUrl || !platform) {
            return res.status(400).json({
                error: 'Missing required fields: backgroundUrl, platform'
            });
        }

        const result = generateCompositeUrl({ backgroundUrl, overlays, platform });
        res.json(result);

    } catch (error) {
        console.error('Composite generation error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Get available export platforms
 * GET /api/ai/platforms
 */
app.get('/api/ai/platforms', (req, res) => {
    res.json({
        platforms: getAvailablePlatforms()
    });
});

// ============================================
// IMAGE ANALYSIS ENDPOINTS
// ============================================

/**
 * Analyze image quality and suitability
 * POST /api/ai/analyze-image
 */
app.post('/api/ai/analyze-image', async (req, res) => {
    try {
        const { image, imageType, brand } = req.body;

        if (!image) {
            return res.status(400).json({
                error: 'Missing required field: image (base64 or URL)'
            });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return res.status(500).json({
                error: 'GEMINI_API_KEY not configured'
            });
        }

        const result = await analyzeImage({ image, imageType, brand }, apiKey);
        res.json(result);

    } catch (error) {
        console.error('Image analysis error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Analyze packshot for retail use
 * POST /api/ai/analyze-packshot
 */
app.post('/api/ai/analyze-packshot', async (req, res) => {
    try {
        const { image, brand } = req.body;

        if (!image) {
            return res.status(400).json({
                error: 'Missing required field: image'
            });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return res.status(500).json({
                error: 'GEMINI_API_KEY not configured'
            });
        }

        const result = await analyzePackshot({ image, brand }, apiKey);
        res.json(result);

    } catch (error) {
        console.error('Packshot analysis error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Analyze logo for brand compliance
 * POST /api/ai/analyze-logo
 */
app.post('/api/ai/analyze-logo', async (req, res) => {
    try {
        const { image, brand } = req.body;

        if (!image) {
            return res.status(400).json({
                error: 'Missing required field: image'
            });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return res.status(500).json({
                error: 'GEMINI_API_KEY not configured'
            });
        }

        const result = await analyzeLogo({ image, brand }, apiKey);
        res.json(result);

    } catch (error) {
        console.error('Logo analysis error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Quick quality check for uploaded images
 * POST /api/ai/quick-quality-check
 */
app.post('/api/ai/quick-quality-check', async (req, res) => {
    try {
        const { image, width, height } = req.body;

        if (!image) {
            return res.status(400).json({
                error: 'Missing required field: image'
            });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        const result = await quickQualityCheck({ image, width, height }, apiKey);
        res.json(result);

    } catch (error) {
        console.error('Quick quality check error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Suggest background treatment
 * POST /api/ai/background-treatment
 */
app.post('/api/ai/background-treatment', async (req, res) => {
    try {
        const { image, targetBackground } = req.body;

        if (!image) {
            return res.status(400).json({
                error: 'Missing required field: image'
            });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return res.status(500).json({
                error: 'GEMINI_API_KEY not configured'
            });
        }

        const result = await suggestBackgroundTreatment({ image, targetBackground }, apiKey);
        res.json(result);

    } catch (error) {
        console.error('Background treatment error:', error);
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// CHAT ASSISTANT ENDPOINTS
// ============================================

/**
 * Process chat message for ad modifications
 * POST /api/ai/chat
 */
app.post('/api/ai/chat', async (req, res) => {
    try {
        const { message, canvasState, brand, platform, chatHistory } = req.body;

        if (!message) {
            return res.status(400).json({
                error: 'Missing required field: message'
            });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return res.status(500).json({
                error: 'GEMINI_API_KEY not configured'
            });
        }

        const result = await processChat({ message, canvasState, brand, platform, chatHistory }, apiKey);
        res.json(result);

    } catch (error) {
        console.error('Chat processing error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Get AI suggestions for improving the ad
 * POST /api/ai/suggestions
 */
app.post('/api/ai/suggestions', async (req, res) => {
    try {
        const { canvasState, brand, platform } = req.body;

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return res.status(500).json({
                error: 'GEMINI_API_KEY not configured'
            });
        }

        const result = await getSuggestions({ canvasState, brand, platform }, apiKey);
        res.json(result);

    } catch (error) {
        console.error('Suggestions error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Explain design choices
 * POST /api/ai/explain
 */
app.post('/api/ai/explain', async (req, res) => {
    try {
        const { element, canvasState, brand } = req.body;

        if (!element) {
            return res.status(400).json({
                error: 'Missing required field: element'
            });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return res.status(500).json({
                error: 'GEMINI_API_KEY not configured'
            });
        }

        const result = await explainDesign({ element, canvasState, brand }, apiKey);
        res.json(result);

    } catch (error) {
        console.error('Explain error:', error);
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// COMBINED GENERATION ENDPOINT
// ============================================

/**
 * Generate complete ad (layout + copy + quick compliance)
 * POST /api/ai/generate-ad
 */
app.post('/api/ai/generate-ad', async (req, res) => {
    try {
        const { brand, product, platform, brandAssets, productBenefits } = req.body;

        if (!brand || !product || !platform) {
            return res.status(400).json({
                error: 'Missing required fields: brand, product, platform'
            });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return res.status(500).json({
                error: 'GEMINI_API_KEY not configured'
            });
        }

        // Generate layout and copy in parallel
        const [layout, copy] = await Promise.all([
            generateLayout({ brand, product, platform, brandAssets }, apiKey),
            generateCopy({ brand, product, platform, productBenefits }, apiKey)
        ]);

        // Quick compliance check on the generated layout
        const compliance = await quickComplianceCheck({
            canvasData: {
                elements: layout.elements,
                palette: layout.palette
            },
            brand
        }, apiKey);

        res.json({
            success: true,
            brand,
            product,
            platform,
            layout,
            copy,
            compliance,
            generatedAt: new Date().toISOString()
        });

    } catch (error) {
        console.error('Ad generation error:', error);
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// IMAGE PROXY ENDPOINT (using Pexels API)
// ============================================

/**
 * Fetch image using Pexels API for keyword-based search
 * Pexels provides free API with proper keyword search
 * GET /api/ai/fetch-image?query=coffee+cup&width=300&height=300
 */
app.get('/api/ai/fetch-image', async (req, res) => {
    try {
        const { query, width = 400, height = 400 } = req.query;

        if (!query) {
            return res.status(400).json({ error: 'Query parameter is required' });
        }

        // Use Pexels API for keyword search
        // Free API key - register at pexels.com/api for your own
        const PEXELS_API_KEY = process.env.PEXELS_API_KEY || 'H2jk9uKnhRmL6WPwh89zBezWvr';

        const searchUrl = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1&size=medium`;

        console.log('[ImageProxy] Searching Pexels for:', query);

        const searchResponse = await fetch(searchUrl, {
            headers: {
                'Authorization': PEXELS_API_KEY
            }
        });

        if (!searchResponse.ok) {
            throw new Error(`Pexels API returned ${searchResponse.status}`);
        }

        const searchData = await searchResponse.json();

        if (!searchData.photos || searchData.photos.length === 0) {
            throw new Error('No images found for: ' + query);
        }

        // Get the first image URL
        const photo = searchData.photos[0];
        const imageUrl = photo.src.medium || photo.src.small || photo.src.original;

        console.log('[ImageProxy] Found image:', imageUrl);

        // Fetch the actual image
        const imageResponse = await fetch(imageUrl);

        if (!imageResponse.ok) {
            throw new Error(`Failed to fetch image: ${imageResponse.status}`);
        }

        const arrayBuffer = await imageResponse.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const contentType = imageResponse.headers.get('content-type') || 'image/jpeg';
        const base64 = buffer.toString('base64');
        const dataUrl = `data:${contentType};base64,${base64}`;

        console.log('[ImageProxy] ✅ Image loaded for "' + query + '", size:', buffer.length, 'bytes');

        res.json({
            success: true,
            dataUrl: dataUrl,
            originalUrl: imageUrl,
            size: buffer.length,
            query: query,
            photographer: photo.photographer,
            source: 'pexels'
        });

    } catch (error) {
        console.error('[ImageProxy] ❌ Error:', error.message);

        // Return a nice placeholder SVG as fallback
        const placeholderSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300">
            <rect fill="#fafafa" width="300" height="300"/>
            <text x="150" y="140" font-family="Arial" font-size="40" fill="#ddd" text-anchor="middle">📷</text>
            <text x="150" y="175" font-family="Arial" font-size="11" fill="#888" text-anchor="middle">${req.query.query || 'Image'}</text>
            <text x="150" y="195" font-family="Arial" font-size="9" fill="#bbb" text-anchor="middle">(${error.message})</text>
        </svg>`;
        const base64Svg = Buffer.from(placeholderSvg).toString('base64');

        res.json({
            success: true,
            dataUrl: `data:image/svg+xml;base64,${base64Svg}`,
            isPlaceholder: true,
            error: error.message
        });
    }
});

// Start server

app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🎨 AdGenius AI Engine v1.1                              ║
║   Running on http://localhost:${PORT}                        ║
║                                                           ║
║   Core Endpoints:                                         ║
║   • POST /api/ai/generate-layout    - Smart layouts       ║
║   • POST /api/ai/generate-copy      - Headlines & CTAs    ║
║   • POST /api/ai/check-compliance   - Vision compliance   ║
║   • POST /api/ai/generate-ad        - Complete ad gen     ║
║                                                           ║
║   Image Analysis (NEW):                                   ║
║   • POST /api/ai/analyze-image      - Full analysis       ║
║   • POST /api/ai/analyze-packshot   - Product images      ║
║   • POST /api/ai/analyze-logo       - Logo validation     ║
║   • POST /api/ai/background-treatment - BG suggestions    ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `);
});

export default app;
