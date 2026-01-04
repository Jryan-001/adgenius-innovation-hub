/**
 * AdGenius Layout Agent
 * 
 * Generates intelligent ad layouts using "Implicit Design Learning"
 * Uses Gemini AI to understand design principles and generate
 * responsive coordinate-based layouts.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

// Layout templates based on successful retail ads
const LAYOUT_TEMPLATES = {
  instagram_story: {
    aspectRatio: '9:16',
    width: 1080,
    height: 1920,
    safeZones: {
      top: 0.15,    // Account for status bar / profile info
      bottom: 0.1   // Account for swipe up / CTA area
    }
  },
  facebook_feed: {
    aspectRatio: '1.91:1',
    width: 1200,
    height: 628,
    safeZones: {
      top: 0.05,
      bottom: 0.05
    }
  },
  retail_display: {
    aspectRatio: '4:3',
    width: 800,
    height: 600,
    safeZones: {
      top: 0.08,
      bottom: 0.08
    }
  }
};

// "Gold Standard" layout patterns learned from successful ads
const DESIGN_CORPUS = [
  {
    name: 'hero_product_center',
    description: 'Product dominates center, logo top-left, text bottom',
    suitability: ['instagram_story', 'retail_display'],
    elements: {
      logo: { x: 0.05, y: 0.05, width: 0.2, height: 0.08 },
      packshot: { x: 0.15, y: 0.25, width: 0.7, height: 0.45 },
      headline: { x: 0.1, y: 0.75, width: 0.8, height: 0.08 },
      cta: { x: 0.25, y: 0.88, width: 0.5, height: 0.06 }
    }
  },
  {
    name: 'split_horizontal',
    description: 'Image left, text right - good for Facebook feed',
    suitability: ['facebook_feed'],
    elements: {
      logo: { x: 0.02, y: 0.05, width: 0.15, height: 0.12 },
      packshot: { x: 0.05, y: 0.2, width: 0.4, height: 0.7 },
      headline: { x: 0.5, y: 0.25, width: 0.45, height: 0.2 },
      cta: { x: 0.55, y: 0.7, width: 0.35, height: 0.15 }
    }
  },
  {
    name: 'stacked_vertical',
    description: 'Logo top, product middle, text bottom - mobile first',
    suitability: ['instagram_story'],
    elements: {
      logo: { x: 0.35, y: 0.05, width: 0.3, height: 0.06 },
      packshot: { x: 0.1, y: 0.18, width: 0.8, height: 0.5 },
      headline: { x: 0.05, y: 0.72, width: 0.9, height: 0.1 },
      cta: { x: 0.2, y: 0.88, width: 0.6, height: 0.06 }
    }
  }
];

const LAYOUT_SYSTEM_PROMPT = `You are an expert Retail Media Creative Director specializing in ad layout design.
Your task is to generate intelligent, platform-optimized ad layouts.

DESIGN PRINCIPLES YOU FOLLOW:
1. Rule of Thirds - Key elements at intersection points
2. Visual Hierarchy - Logo visible but not dominant, product is the hero
3. Breathing Space - Minimum 5% padding from edges
4. Platform Optimization - Respect safe zones for each platform
5. Brand Consistency - Follow provided color palette

You will receive:
- Brand name and colors
- Platform (instagram_story, facebook_feed, retail_display)
- Product information

You must return ONLY valid JSON with this exact structure:
{
  "layoutName": "descriptive_name",
  "elements": [
    { "id": "logo", "x": 0.05, "y": 0.05, "width": 0.2, "height": 0.08 },
    { "id": "packshot", "x": 0.15, "y": 0.25, "width": 0.7, "height": 0.45 },
    { "id": "headline", "x": 0.1, "y": 0.75, "width": 0.8, "height": 0.08 },
    { "id": "cta", "x": 0.25, "y": 0.88, "width": 0.5, "height": 0.06 }
  ],
  "palette": {
    "background": "#FFFFFF",
    "primary": "#brand_primary_color",
    "secondary": "#brand_secondary_color",
    "text": "#333333"
  },
  "typography": {
    "headlineSize": "large",
    "ctaSize": "medium"
  }
}

IMPORTANT: All x, y, width, height values are PERCENTAGES (0.0 to 1.0) of the canvas.
This ensures responsive scaling across different screen sizes.`;

/**
 * Initialize the Gemini client
 */
function getGeminiClient(apiKey) {
  return new GoogleGenerativeAI(apiKey);
}

/**
 * Select the best base layout template for the platform
 */
function selectBaseLayout(platform) {
  const suitable = DESIGN_CORPUS.filter(layout => 
    layout.suitability.includes(platform)
  );
  return suitable[0] || DESIGN_CORPUS[0];
}

/**
 * Generate an intelligent ad layout using Gemini AI
 * 
 * @param {Object} params - Layout generation parameters
 * @param {string} params.brand - Brand name (e.g., "Tesco")
 * @param {string} params.product - Product name (e.g., "Chocolate Bar")
 * @param {string} params.platform - Target platform
 * @param {Object} params.brandAssets - Brand assets including colors, logo
 * @param {string} apiKey - Gemini API key
 * @returns {Object} Generated layout with element positions
 */
export async function generateLayout(params, apiKey) {
  const { brand, product, platform, brandAssets } = params;
  
  // Get platform specifications
  const platformSpec = LAYOUT_TEMPLATES[platform] || LAYOUT_TEMPLATES.instagram_story;
  
  // Get base layout for few-shot learning
  const baseLayout = selectBaseLayout(platform);
  
  try {
    const genAI = getGeminiClient(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash',
      generationConfig: {
        responseMimeType: 'application/json'
      }
    });
    
    const prompt = `${LAYOUT_SYSTEM_PROMPT}

CONTEXT:
- Brand: ${brand}
- Product: ${product}
- Platform: ${platform} (${platformSpec.width}x${platformSpec.height}px)
- Brand Colors: ${JSON.stringify(brandAssets?.primaryColors || ['#E41C2A', '#FFFFFF'])}
- Safe Zones: Top ${platformSpec.safeZones.top * 100}%, Bottom ${platformSpec.safeZones.bottom * 100}%

EXAMPLE SUCCESSFUL LAYOUT (for reference):
${JSON.stringify(baseLayout, null, 2)}

Generate an optimized layout for this specific ad. Return ONLY valid JSON.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Parse the JSON response
    const layout = JSON.parse(text);
    
    // Add platform metadata
    return {
      success: true,
      platform,
      dimensions: {
        width: platformSpec.width,
        height: platformSpec.height,
        aspectRatio: platformSpec.aspectRatio
      },
      ...layout
    };
    
  } catch (error) {
    console.error('Layout generation error:', error);
    
    // Fallback to template-based layout
    return {
      success: true,
      platform,
      dimensions: {
        width: platformSpec.width,
        height: platformSpec.height,
        aspectRatio: platformSpec.aspectRatio
      },
      layoutName: baseLayout.name,
      elements: Object.entries(baseLayout.elements).map(([id, pos]) => ({
        id,
        ...pos
      })),
      palette: {
        background: '#FFFFFF',
        primary: brandAssets?.primaryColors?.[0] || '#E41C2A',
        secondary: brandAssets?.primaryColors?.[1] || '#FFFFFF',
        text: '#333333'
      },
      typography: {
        headlineSize: 'large',
        ctaSize: 'medium'
      },
      fallback: true
    };
  }
}

/**
 * Generate layouts for multiple platforms at once
 */
export async function generateMultiPlatformLayouts(params, apiKey) {
  const platforms = ['instagram_story', 'facebook_feed', 'retail_display'];
  
  const layouts = await Promise.all(
    platforms.map(platform => 
      generateLayout({ ...params, platform }, apiKey)
    )
  );
  
  return {
    success: true,
    layouts: Object.fromEntries(
      platforms.map((platform, index) => [platform, layouts[index]])
    )
  };
}

export { LAYOUT_TEMPLATES, DESIGN_CORPUS };
