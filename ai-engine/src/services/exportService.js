/**
 * AdGenius Export Service
 * 
 * Handles multi-format ad export using Cloudinary transformations.
 * Generates optimized URLs for Facebook, Instagram, and Retail displays.
 */

// Platform export configurations
const EXPORT_CONFIGS = {
    facebook_feed: {
        name: 'Facebook Feed',
        width: 1200,
        height: 628,
        format: 'jpg',
        quality: 'auto:good',
        maxFileSize: 500000, // 500KB
        transformations: [
            'c_fill',
            'g_auto',
            'f_auto',
            'q_auto:good'
        ]
    },
    instagram_story: {
        name: 'Instagram Story',
        width: 1080,
        height: 1920,
        format: 'jpg',
        quality: 'auto:good',
        maxFileSize: 500000,
        transformations: [
            'c_fill',
            'g_auto',
            'f_auto',
            'q_auto:good'
        ]
    },
    instagram_feed: {
        name: 'Instagram Feed',
        width: 1080,
        height: 1080,
        format: 'jpg',
        quality: 'auto:good',
        maxFileSize: 500000,
        transformations: [
            'c_fill',
            'g_auto',
            'f_auto',
            'q_auto:good'
        ]
    },
    retail_display: {
        name: 'Retail Display',
        width: 800,
        height: 600,
        format: 'png',
        quality: 'auto:best',
        maxFileSize: 500000,
        transformations: [
            'c_fill',
            'g_auto',
            'f_auto',
            'q_auto:best'
        ]
    },
    retail_poster: {
        name: 'Retail Poster',
        width: 1200,
        height: 1600,
        format: 'png',
        quality: 'auto:best',
        maxFileSize: 500000,
        transformations: [
            'c_fill',
            'g_auto',
            'f_auto',
            'q_auto:best'
        ]
    }
};

/**
 * Generate Cloudinary transformation URL
 * 
 * @param {string} baseImageUrl - Original Cloudinary image URL
 * @param {string} platform - Target platform
 * @returns {Object} Transformation details and URL
 */
export function generateCloudinaryUrl(baseImageUrl, platform) {
    const config = EXPORT_CONFIGS[platform];

    if (!config) {
        throw new Error(`Unknown platform: ${platform}`);
    }

    // Parse Cloudinary URL to insert transformations
    // Expected format: https://res.cloudinary.com/{cloud_name}/image/upload/{public_id}

    const urlParts = baseImageUrl.split('/upload/');
    if (urlParts.length !== 2) {
        // Return original URL with metadata if not a Cloudinary URL
        return {
            platform,
            name: config.name,
            dimensions: `${config.width}x${config.height}`,
            url: baseImageUrl,
            isCloudinary: false
        };
    }

    const [baseUrl, publicId] = urlParts;

    // Build transformation string
    const transformations = [
        `w_${config.width}`,
        `h_${config.height}`,
        ...config.transformations
    ].join(',');

    const transformedUrl = `${baseUrl}/upload/${transformations}/${publicId}`;

    return {
        platform,
        name: config.name,
        dimensions: `${config.width}x${config.height}`,
        format: config.format,
        url: transformedUrl,
        isCloudinary: true,
        maxFileSize: `${config.maxFileSize / 1000}KB`
    };
}

/**
 * Generate export URLs for all platforms
 * 
 * @param {string} baseImageUrl - Original image URL
 * @param {string[]} platforms - Platforms to export (optional, defaults to all)
 * @returns {Object} Export URLs for all platforms
 */
export function generateAllExports(baseImageUrl, platforms = null) {
    const targetPlatforms = platforms || Object.keys(EXPORT_CONFIGS);

    const exports = {};

    for (const platform of targetPlatforms) {
        try {
            exports[platform] = generateCloudinaryUrl(baseImageUrl, platform);
        } catch (error) {
            exports[platform] = {
                platform,
                error: error.message
            };
        }
    }

    return {
        success: true,
        source: baseImageUrl,
        exports,
        generatedAt: new Date().toISOString()
    };
}

/**
 * Create a composite ad image URL with overlays
 * This is for when we need to combine multiple elements
 * 
 * @param {Object} params - Composite parameters
 * @param {string} params.backgroundUrl - Background image URL
 * @param {Object} params.overlays - Overlay elements (logo, product, text)
 * @param {string} params.platform - Target platform
 * @returns {string} Composite image URL
 */
export function generateCompositeUrl(params) {
    const { backgroundUrl, overlays, platform } = params;
    const config = EXPORT_CONFIGS[platform] || EXPORT_CONFIGS.facebook_feed;

    // Parse background URL
    const urlParts = backgroundUrl.split('/upload/');
    if (urlParts.length !== 2) {
        return { error: 'Invalid Cloudinary URL format' };
    }

    const [baseUrl, bgPublicId] = urlParts;

    // Build transformation chain
    let transformationChain = [
        `w_${config.width}`,
        `h_${config.height}`,
        'c_fill'
    ];

    // Add overlays if provided
    if (overlays?.logo) {
        const logoOverlay = [
            `l_${overlays.logo.publicId}`,
            `w_${Math.round(config.width * (overlays.logo.width || 0.15))}`,
            `g_north_west`,
            `x_${Math.round(config.width * (overlays.logo.x || 0.05))}`,
            `y_${Math.round(config.height * (overlays.logo.y || 0.05))}`
        ].join(',');
        transformationChain.push(logoOverlay);
    }

    if (overlays?.product) {
        const productOverlay = [
            `l_${overlays.product.publicId}`,
            `w_${Math.round(config.width * (overlays.product.width || 0.5))}`,
            `g_center`,
            `y_${Math.round(config.height * (overlays.product.y || 0))}`,
            'e_background_removal'
        ].join(',');
        transformationChain.push(productOverlay);
    }

    // Add text overlay if provided
    if (overlays?.headline) {
        const textOverlay = [
            `l_text:Arial_40_bold:${encodeURIComponent(overlays.headline.text)}`,
            `co_rgb:${overlays.headline.color?.replace('#', '') || '333333'}`,
            `g_south`,
            `y_${Math.round(config.height * 0.15)}`
        ].join(',');
        transformationChain.push(textOverlay);
    }

    // Add quality optimization
    transformationChain.push('f_auto', 'q_auto');

    const compositeUrl = `${baseUrl}/upload/${transformationChain.join('/')}/${bgPublicId}`;

    return {
        success: true,
        platform,
        dimensions: `${config.width}x${config.height}`,
        url: compositeUrl
    };
}

/**
 * Get export configuration for a platform
 */
export function getExportConfig(platform) {
    return EXPORT_CONFIGS[platform] || null;
}

/**
 * Get all available export platforms
 */
export function getAvailablePlatforms() {
    return Object.entries(EXPORT_CONFIGS).map(([key, config]) => ({
        id: key,
        name: config.name,
        dimensions: `${config.width}x${config.height}`,
        format: config.format
    }));
}

export { EXPORT_CONFIGS };
