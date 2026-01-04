/**
 * Project Routes
 * 
 * CRUD operations for ad projects.
 */

import express from 'express';
import Project from '../models/Project.js';

const router = express.Router();

/**
 * Get all projects
 * GET /api/projects
 */
router.get('/', async (req, res) => {
    try {
        const projects = await Project.find().sort({ updatedAt: -1 });
        res.json({ projects });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * Get single project
 * GET /api/projects/:id
 */
router.get('/:id', async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }
        res.json(project);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * Create project
 * POST /api/projects
 */
router.post('/', async (req, res) => {
    try {
        const { name, brand, product, platform, canvasData } = req.body;

        const project = new Project({
            name,
            brand,
            product,
            platform,
            canvasData: canvasData || {}
        });

        await project.save();
        res.status(201).json(project);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * Update project
 * PUT /api/projects/:id
 */
router.put('/:id', async (req, res) => {
    try {
        const project = await Project.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true }
        );

        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        res.json(project);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * Delete project
 * DELETE /api/projects/:id
 */
router.delete('/:id', async (req, res) => {
    try {
        const project = await Project.findByIdAndDelete(req.params.id);

        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        res.json({ success: true, message: 'Project deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
