/**
 * AdGenius Shared Types
 * 
 * Common interfaces and types used across ai-engine, backend, and frontend.
 * This ensures all team members work with consistent data structures.
 */

// ============================================
// LAYOUT TYPES
// ============================================

/**
 * @typedef {Object} LayoutElement
 * @property {string} id - Element identifier (logo, packshot, headline, cta)
 * @property {number} x - X position as percentage (0.0 to 1.0)
 * @property {number} y - Y position as percentage (0.0 to 1.0)
 * @property {number} width - Width as percentage (0.0 to 1.0)
 * @property {number} height - Height as percentage (0.0 to 1.0)
 */

/**
 * @typedef {Object} ColorPalette
 * @property {string} background - Background color hex
 * @property {string} primary - Primary brand color hex
 * @property {string} secondary - Secondary color hex
 * @property {string} text - Text color hex
 */

/**
 * @typedef {Object} LayoutResult
 * @property {boolean} success
 * @property {string} platform
 * @property {Object} dimensions
 * @property {string} layoutName
 * @property {LayoutElement[]} elements
 * @property {ColorPalette} palette
 */

// ============================================
// COPY TYPES
// ============================================

/**
 * @typedef {Object} CopyResult
 * @property {boolean} success
 * @property {string} brand
 * @property {string} platform
 * @property {string[]} headlines
 * @property {string[]} ctas
 * @property {string} tagline
 * @property {number} recommendedHeadline
 * @property {number} recommendedCta
 */

// ============================================
// COMPLIANCE TYPES
// ============================================

/**
 * @typedef {Object} ComplianceCheck
 * @property {string} ruleId
 * @property {string} rule
 * @property {boolean} passed
 * @property {number} score - 0 to 100
 * @property {string} feedback
 */

/**
 * @typedef {Object} ComplianceResult
 * @property {boolean} success
 * @property {string} brand
 * @property {number} overallScore
 * @property {'PASS'|'WARNING'|'FAIL'} status
 * @property {ComplianceCheck[]} checks
 * @property {string[]} actionableImprovements
 * @property {string[]} strengths
 */

// ============================================
// PLATFORM CONFIGURATIONS
// ============================================

export const PLATFORMS = {
    INSTAGRAM_STORY: 'instagram_story',
    INSTAGRAM_FEED: 'instagram_feed',
    FACEBOOK_FEED: 'facebook_feed',
    RETAIL_DISPLAY: 'retail_display',
    RETAIL_POSTER: 'retail_poster'
};

export const PLATFORM_DIMENSIONS = {
    instagram_story: { width: 1080, height: 1920, aspectRatio: '9:16' },
    instagram_feed: { width: 1080, height: 1080, aspectRatio: '1:1' },
    facebook_feed: { width: 1200, height: 628, aspectRatio: '1.91:1' },
    retail_display: { width: 800, height: 600, aspectRatio: '4:3' },
    retail_poster: { width: 1200, height: 1600, aspectRatio: '3:4' }
};

// ============================================
// API REQUEST/RESPONSE TYPES
// ============================================

/**
 * @typedef {Object} GenerateLayoutRequest
 * @property {string} brand
 * @property {string} product
 * @property {string} platform
 * @property {Object} brandAssets
 */

/**
 * @typedef {Object} GenerateCopyRequest
 * @property {string} brand
 * @property {string} product
 * @property {string} platform
 * @property {string} [productBenefits]
 * @property {string} [campaignGoal]
 */

/**
 * @typedef {Object} CheckComplianceRequest
 * @property {string} canvasImage - Base64 or URL
 * @property {string} brand
 * @property {Object} [adMetadata]
 */

/**
 * @typedef {Object} ExportRequest
 * @property {string} imageUrl
 * @property {string[]} [platforms]
 */

// ============================================
// BRAND TYPES
// ============================================

/**
 * @typedef {Object} BrandGuideline
 * @property {string} id
 * @property {string} rule
 * @property {string} description
 * @property {'high'|'medium'|'low'} weight
 */

/**
 * @typedef {Object} Brand
 * @property {string} name
 * @property {string[]} colors
 * @property {string} logoUrl
 * @property {string} voiceDescription
 * @property {BrandGuideline[]} rules
 */

// ============================================
// PROJECT TYPES
// ============================================

/**
 * @typedef {Object} Project
 * @property {string} id
 * @property {string} userId
 * @property {string} brand
 * @property {string} product
 * @property {string} platform
 * @property {Object} canvasData
 * @property {ComplianceResult} complianceStatus
 * @property {Date} createdAt
 * @property {Date} updatedAt
 */

export default {
    PLATFORMS,
    PLATFORM_DIMENSIONS
};
