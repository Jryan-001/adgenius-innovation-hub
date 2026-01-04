/**
 * AdGenius Image Analysis Agent
 * 
 * Analyzes uploaded packshots and images for quality,
 * suitability for advertising, and AI enhancement suggestions.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

// Image quality standards for retail advertising
const QUALITY_STANDARDS = {
    minimumResolution: { width: 800, height: 800 },
    preferredResolution: { width: 2000, height: 2000 },
    acceptableFormats: ['jpg', 'jpeg', 'png', 'webp'],
    maxFileSizeMB: 10,
    minDPI: 150,
    preferredDPI: 300
};

// Analysis categories
const ANALYSIS_CATEGORIES = {
    PACKSHOT: 'packshot',
    LOGO: 'logo',
    BACKGROUND: 'background',
    LIFESTYLE: 'lifestyle',
    PRODUCT_IN_USE: 'product_in_use'
};

const IMAGE_ANALYSIS_PROMPT = `You are an expert Image Quality Analyst specializing in retail product photography and advertising assets.

Analyze this image for its suitability in retail advertising campaigns.

=== ANALYSIS DIMENSIONS ===

1. IMAGE QUALITY
   - Resolution and sharpness (is it crisp or pixelated?)
   - Lighting quality (even, professional, no harsh shadows?)
   - Color accuracy (true-to-life, not over/under-saturated?)
   - Focus (is the main subject in sharp focus?)
   - Noise level (clean image or grainy?)

2. COMPOSITION
   - Subject placement (centered, rule of thirds?)
   - Background suitability (clean, distracting elements?)
   - Cropping (adequate margins, nothing cut off?)
   - Aspect ratio versatility (can it be adapted to different formats?)

3. PRODUCT PRESENTATION (for packshots)
   - Product visibility (packaging fully visible?)
   - Product angle (front-facing, appealing perspective?)
   - Label/branding legibility (can you read product info?)
   - Product condition (no damage, wrinkles, or defects?)

4. BACKGROUND ANALYSIS
   - Background type (solid, gradient, lifestyle, transparent?)
   - Background removal potential (clean edges? easy to extract?)
   - Color compatibility with brand palettes

5. ADVERTISING SUITABILITY
   - Hero image potential (can this be the main visual?)
   - Thumbnail effectiveness (works at small sizes?)
   - Text overlay areas (space for headlines/CTAs?)
   - Platform adaptability (works for social, web, print?)

=== ENHANCEMENT RECOMMENDATIONS ===

Provide specific suggestions for:
- Background removal/replacement
- Color correction or enhancement
- Cropping or recomposition
- Retouching needs
- Format recommendations

=== OUTPUT FORMAT ===

Return ONLY valid JSON:
{
  "imageType": "packshot|logo|background|lifestyle|product_in_use|other",
  "overallQuality": 85,
  "qualityGrade": "A|B|C|D|F",
  "suitableForAdvertising": true,
  "analysis": {
    "resolution": {
      "score": 90,
      "assessment": "High resolution, suitable for all platforms",
      "estimatedDimensions": "2000x2000px"
    },
    "lighting": {
      "score": 85,
      "assessment": "Professional lighting with even illumination"
    },
    "composition": {
      "score": 80,
      "assessment": "Well-composed with good subject placement"
    },
    "productPresentation": {
      "score": 90,
      "assessment": "Product clearly visible and appealing"
    },
    "backgroundAnalysis": {
      "type": "solid_white",
      "removalDifficulty": "easy",
      "score": 95
    }
  },
  "strengths": [
    "What makes this image effective"
  ],
  "issues": [
    "Problems that may affect advertising use"
  ],
  "enhancements": [
    {
      "type": "background_removal",
      "priority": "high",
      "description": "Remove white background for versatile placement"
    }
  ],
  "platformRecommendations": {
    "instagram_story": { "suitable": true, "notes": "Good vertical crop potential" },
    "facebook_feed": { "suitable": true, "notes": "Works well for horizontal" },
    "retail_display": { "suitable": true, "notes": "High quality for print" }
  },
  "technicalSpecs": {
    "hasTransparency": false,
    "dominantColors": ["#FFFFFF", "#E41C2A"],
    "aspectRatio": "1:1",
    "estimatedFileSize": "1.2MB"
  }
}`;

/**
 * Initialize the Gemini client
 */
function getGeminiClient(apiKey) {
    return new GoogleGenerativeAI(apiKey);
}

/**
 * Analyze an image for quality and advertising suitability
 * 
 * @param {Object} params - Analysis parameters
 * @param {string} params.image - Base64 image data or URL
 * @param {string} params.imageType - Expected type (packshot, logo, etc.)
 * @param {string} params.brand - Brand context for palette matching
 * @param {string} apiKey - Gemini API key
 * @returns {Object} Comprehensive image analysis
 */
export async function analyzeImage(params, apiKey) {
    const { image, imageType, brand } = params;

    try {
        const genAI = getGeminiClient(apiKey);

        const model = genAI.getGenerativeModel({
            model: 'gemini-2.0-flash',
            generationConfig: {
                responseMimeType: 'application/json'
            }
        });

        // Prepare image part
        let imagePart;
        if (image.startsWith('data:')) {
            const base64Data = image.split(',')[1];
            const mimeType = image.split(';')[0].split(':')[1];
            imagePart = {
                inlineData: {
                    data: base64Data,
                    mimeType: mimeType || 'image/png'
                }
            };
        } else if (image.startsWith('http')) {
            const response = await fetch(image);
            const buffer = await response.arrayBuffer();
            const base64Data = Buffer.from(buffer).toString('base64');
            imagePart = {
                inlineData: {
                    data: base64Data,
                    mimeType: 'image/png'
                }
            };
        } else {
            imagePart = {
                inlineData: {
                    data: image,
                    mimeType: 'image/png'
                }
            };
        }

        const contextPrompt = `${IMAGE_ANALYSIS_PROMPT}

CONTEXT:
- Expected image type: ${imageType || 'auto-detect'}
- Brand context: ${brand || 'General retail'}

Analyze this image thoroughly for retail advertising use.`;

        const result = await model.generateContent([contextPrompt, imagePart]);
        const response = await result.response;
        const text = response.text();

        const analysis = JSON.parse(text);

        return {
            success: true,
            timestamp: new Date().toISOString(),
            ...analysis
        };

    } catch (error) {
        console.error('Image analysis error:', error);

        return {
            success: false,
            error: error.message,
            fallbackAnalysis: {
                overallQuality: 70,
                qualityGrade: 'B',
                suitableForAdvertising: true,
                message: 'Unable to perform AI analysis. Manual review recommended.'
            }
        };
    }
}

/**
 * Quick quality check for uploaded images
 * 
 * @param {Object} params - Check parameters
 * @param {string} params.image - Base64 or URL
 * @param {number} params.width - Image width (if known)
 * @param {number} params.height - Image height (if known)
 * @returns {Object} Quick quality assessment
 */
export async function quickQualityCheck(params, apiKey) {
    const { image, width, height } = params;

    const issues = [];
    const passed = [];

    // Resolution check
    if (width && height) {
        if (width >= QUALITY_STANDARDS.preferredResolution.width &&
            height >= QUALITY_STANDARDS.preferredResolution.height) {
            passed.push({ check: 'Resolution', status: 'Excellent quality resolution' });
        } else if (width >= QUALITY_STANDARDS.minimumResolution.width &&
            height >= QUALITY_STANDARDS.minimumResolution.height) {
            passed.push({ check: 'Resolution', status: 'Acceptable resolution' });
        } else {
            issues.push({
                check: 'Resolution',
                status: `Low resolution (${width}x${height}). Minimum ${QUALITY_STANDARDS.minimumResolution.width}x${QUALITY_STANDARDS.minimumResolution.height} required.`
            });
        }
    }

    // For more detailed analysis, call the full analysis
    if (apiKey && issues.length === 0) {
        try {
            const genAI = getGeminiClient(apiKey);
            const model = genAI.getGenerativeModel({
                model: 'gemini-2.0-flash',
                generationConfig: {
                    responseMimeType: 'application/json'
                }
            });

            let imagePart;
            if (image.startsWith('data:')) {
                const base64Data = image.split(',')[1];
                imagePart = {
                    inlineData: { data: base64Data, mimeType: 'image/png' }
                };
            } else {
                imagePart = {
                    inlineData: { data: image, mimeType: 'image/png' }
                };
            }

            const quickPrompt = `Quickly assess this image for retail advertising use.
      
Return JSON:
{
  "quality": "high|medium|low",
  "isProductImage": true,
  "hasCleanBackground": true,
  "mainIssue": "Brief description if any issue exists",
  "recommendation": "One key suggestion"
}`;

            const result = await model.generateContent([quickPrompt, imagePart]);
            const quickAnalysis = JSON.parse(result.response.text());

            return {
                success: true,
                quickCheck: true,
                ...quickAnalysis,
                issues,
                passed
            };

        } catch (error) {
            console.error('Quick check error:', error);
        }
    }

    return {
        success: true,
        quickCheck: true,
        issues,
        passed,
        quality: issues.length === 0 ? 'acceptable' : 'needs_review'
    };
}

/**
 * Analyze packshot specifically for e-commerce/retail use
 */
export async function analyzePackshot(params, apiKey) {
    return analyzeImage({
        ...params,
        imageType: ANALYSIS_CATEGORIES.PACKSHOT
    }, apiKey);
}

/**
 * Analyze logo for brand compliance
 */
export async function analyzeLogo(params, apiKey) {
    const { image, brand } = params;

    try {
        const genAI = getGeminiClient(apiKey);

        const model = genAI.getGenerativeModel({
            model: 'gemini-2.0-flash',
            generationConfig: {
                responseMimeType: 'application/json'
            }
        });

        let imagePart;
        if (image.startsWith('data:')) {
            const base64Data = image.split(',')[1];
            imagePart = {
                inlineData: { data: base64Data, mimeType: 'image/png' }
            };
        } else {
            imagePart = {
                inlineData: { data: image, mimeType: 'image/png' }
            };
        }

        const logoPrompt = `Analyze this logo image for advertising use.

Check:
1. Logo clarity and resolution
2. Background (transparent, solid, or complex?)
3. Color variations available (full color, mono, reverse?)
4. Clear space requirements
5. Minimum size usability

Return JSON:
{
  "isValidLogo": true,
  "hasTransparency": true,
  "colorMode": "full_color|monochrome|reverse",
  "backgroundType": "transparent|solid|complex",
  "quality": "high|medium|low",
  "minimumUsableSize": "50x50px",
  "clearSpaceRatio": "1:1",
  "issues": [],
  "recommendations": []
}`;

        const result = await model.generateContent([logoPrompt, imagePart]);
        const analysis = JSON.parse(result.response.text());

        return {
            success: true,
            imageType: 'logo',
            brand: brand || 'Unknown',
            ...analysis
        };

    } catch (error) {
        console.error('Logo analysis error:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Suggest background removal or enhancement
 */
export async function suggestBackgroundTreatment(params, apiKey) {
    const { image, targetBackground } = params;

    try {
        const genAI = getGeminiClient(apiKey);

        const model = genAI.getGenerativeModel({
            model: 'gemini-2.0-flash',
            generationConfig: {
                responseMimeType: 'application/json'
            }
        });

        let imagePart;
        if (image.startsWith('data:')) {
            const base64Data = image.split(',')[1];
            imagePart = {
                inlineData: { data: base64Data, mimeType: 'image/png' }
            };
        } else {
            imagePart = {
                inlineData: { data: image, mimeType: 'image/png' }
            };
        }

        const bgPrompt = `Analyze this image's background for removal or replacement suitability.

Target background style: ${targetBackground || 'transparent or brand-colored'}

Return JSON:
{
  "currentBackground": {
    "type": "solid|gradient|complex|lifestyle",
    "color": "#FFFFFF or 'multicolor'",
    "complexity": "low|medium|high"
  },
  "removalDifficulty": "easy|moderate|difficult",
  "edgeQuality": "clean|fuzzy|complex",
  "recommendations": [
    {
      "treatment": "remove|replace|blur|gradient",
      "reason": "Why this treatment works"
    }
  ],
  "cloudinaryTransform": "e_background_removal or similar suggestion"
}`;

        const result = await model.generateContent([bgPrompt, imagePart]);
        const analysis = JSON.parse(result.response.text());

        return {
            success: true,
            ...analysis
        };

    } catch (error) {
        console.error('Background analysis error:', error);
        return {
            success: false,
            error: error.message,
            defaultRecommendation: 'Use Cloudinary background_removal for automatic processing'
        };
    }
}

export { QUALITY_STANDARDS, ANALYSIS_CATEGORIES };
