/**
 * Brand Model
 * 
 * Stores brand guidelines, colors, and compliance rules.
 */

import mongoose from 'mongoose';

const brandSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    colors: [{
        type: String // Hex codes like '#E41C2A'
    }],
    voiceDescription: {
        type: String,
        default: 'Professional, clear, engaging'
    },
    logoUrl: {
        type: String
    },
    rules: [{
        id: String,
        rule: String,
        description: String,
        weight: {
            type: String,
            enum: ['high', 'medium', 'low'],
            default: 'medium'
        }
    }],
    assets: {
        logos: [String],
        backgrounds: [String],
        fonts: [String]
    }
}, {
    timestamps: true
});

// Create slug from name before saving
brandSchema.pre('save', function (next) {
    if (this.isModified('name')) {
        this.slug = this.name.toLowerCase().replace(/\s+/g, '-');
    }
    next();
});

const Brand = mongoose.model('Brand', brandSchema);

export default Brand;
