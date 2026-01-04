/**
 * Brand Routes
 * 
 * Manage brand guidelines and assets.
 */

import express from 'express';
import Brand from '../models/Brand.js';

const router = express.Router();

// Default Tesco brand for demo
const DEFAULT_TESCO = {
    name: 'Tesco',
    slug: 'tesco',
    colors: ['#E41C2A', '#FFFFFF', '#00539F'],
    voiceDescription: 'Helpful, simple, value-driven',
    logoUrl: '',
    rules: [
        {
            id: 'logo_visibility',
            rule: 'Logo Visibility',
            description: 'Tesco logo must be in top 20% of canvas',
            weight: 'high'
        },
        {
            id: 'color_palette',
            rule: 'Color Palette',
            description: 'Use only Tesco brand colors',
            weight: 'high'
        },
        {
            id: 'brand_voice',
            rule: 'Brand Voice',
            description: 'Copy should feel helpful, simple, value-driven',
            weight: 'medium'
        }
    ]
};

/**
 * Get all brands
 * GET /api/brands
 */
router.get('/', async (req, res) => {
    try {
        let brands = await Brand.find();

        // Return default Tesco if no brands exist
        if (brands.length === 0) {
            brands = [DEFAULT_TESCO];
        }

        res.json({ brands });
    } catch (error) {
        // Return default if DB not connected
        res.json({ brands: [DEFAULT_TESCO] });
    }
});

/**
 * Get single brand
 * GET /api/brands/:slug
 */
router.get('/:slug', async (req, res) => {
    try {
        if (req.params.slug.toLowerCase() === 'tesco') {
            // Return default Tesco
            return res.json(DEFAULT_TESCO);
        }

        const brand = await Brand.findOne({ slug: req.params.slug });
        if (!brand) {
            return res.status(404).json({ error: 'Brand not found' });
        }
        res.json(brand);
    } catch (error) {
        // Return default Tesco for demo
        if (req.params.slug.toLowerCase() === 'tesco') {
            return res.json(DEFAULT_TESCO);
        }
        res.status(500).json({ error: error.message });
    }
});

/**
 * Create brand
 * POST /api/brands
 */
router.post('/', async (req, res) => {
    try {
        const { name, colors, voiceDescription, logoUrl, rules } = req.body;

        const brand = new Brand({
            name,
            slug: name.toLowerCase().replace(/\s+/g, '-'),
            colors,
            voiceDescription,
            logoUrl,
            rules
        });

        await brand.save();
        res.status(201).json(brand);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * Update brand
 * PUT /api/brands/:slug
 */
router.put('/:slug', async (req, res) => {
    try {
        const brand = await Brand.findOneAndUpdate(
            { slug: req.params.slug },
            { $set: req.body },
            { new: true }
        );

        if (!brand) {
            return res.status(404).json({ error: 'Brand not found' });
        }

        res.json(brand);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
