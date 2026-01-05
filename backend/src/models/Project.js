/**
 * Project Model
 * 
 * Stores ad project data including canvas state and compliance status.
 */

import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    brand: {
        type: String,
        required: true
    },
    product: {
        type: String,
        required: true
    },
    platform: {
        type: String,
        enum: ['instagram_story', 'instagram_feed', 'facebook_feed', 'retail_display', 'retail_poster'],
        default: 'instagram_story'
    },
    // Store full Fabric.js canvas JSON - allows any structure
    canvasData: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    // Store canvas thumbnail as base64 or URL for quick preview
    thumbnail: {
        type: String,
        default: null
    },
    // Aspect ratio for canvas restoration
    aspectRatio: {
        type: String,
        default: '1:1'
    },

    complianceStatus: {
        score: Number,
        status: {
            type: String,
            enum: ['PASS', 'WARNING', 'FAIL', 'PENDING'],
            default: 'PENDING'
        },
        lastChecked: Date,
        checks: [{
            ruleId: String,
            passed: Boolean,
            score: Number,
            feedback: String
        }]
    },
    assets: {
        backgroundUrl: String,
        packshots: [String],
        logoUrl: String
    },
    exportUrls: {
        instagram_story: String,
        facebook_feed: String,
        retail_display: String
    }
}, {
    timestamps: true
});

// Index for faster queries
projectSchema.index({ brand: 1, createdAt: -1 });

const Project = mongoose.model('Project', projectSchema);

export default Project;
