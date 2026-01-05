/**
 * Cloudinary Configuration
 * 
 * Provides image upload, transformation, and delivery via Cloudinary CDN.
 */

import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary with credentials from environment
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
});

/**
 * Upload an image to Cloudinary
 * @param {string} imageData - Base64 data URL or file path
 * @param {object} options - Upload options (folder, public_id, etc.)
 * @returns {Promise<object>} Upload result
 */
export async function uploadImage(imageData, options = {}) {
    try {
        const uploadOptions = {
            folder: options.folder || 'adgenius',
            public_id: options.public_id,
            resource_type: 'image',
            transformation: options.transformation,
            ...options
        };

        const result = await cloudinary.uploader.upload(imageData, uploadOptions);

        return {
            success: true,
            url: result.secure_url,
            publicId: result.public_id,
            width: result.width,
            height: result.height,
            format: result.format,
            bytes: result.bytes
        };
    } catch (error) {
        console.error('Cloudinary upload error:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Generate a transformed image URL
 * @param {string} publicId - Cloudinary public ID
 * @param {object} transforms - Transformation options
 * @returns {string} Transformed image URL
 */
export function getImageUrl(publicId, transforms = {}) {
    return cloudinary.url(publicId, {
        width: transforms.width,
        height: transforms.height,
        crop: transforms.crop || 'fill',
        quality: transforms.quality || 'auto',
        format: transforms.format || 'auto',
        ...transforms
    });
}

/**
 * Delete an image from Cloudinary
 * @param {string} publicId - Cloudinary public ID
 * @returns {Promise<object>} Deletion result
 */
export async function deleteImage(publicId) {
    try {
        const result = await cloudinary.uploader.destroy(publicId);
        return { success: result.result === 'ok' };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

/**
 * Fetch an external image via Cloudinary (CORS bypass + optimization)
 * @param {string} url - External image URL
 * @param {object} options - Transformation options
 * @returns {Promise<object>} Transformed image data
 */
export async function fetchExternalImage(url, options = {}) {
    try {
        const width = options.width || 300;
        const height = options.height || 300;

        // Use Cloudinary's fetch feature to grab and transform external images
        const transformedUrl = cloudinary.url(url, {
            type: 'fetch',
            width,
            height,
            crop: 'fill',
            quality: 'auto',
            format: 'auto'
        });

        return {
            success: true,
            url: transformedUrl
        };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

export default cloudinary;
