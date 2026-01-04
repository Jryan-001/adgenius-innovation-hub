/**
 * AdGenius Copy Agent
 * 
 * Generates compelling headlines, taglines, and CTAs
 * following brand voice and retail advertising best practices.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

// Brand voice profiles for major retailers
const BRAND_VOICES = {
    tesco: {
        tone: 'Helpful, simple, value-driven',
        personality: 'Friendly neighbor who knows good deals',
        avoid: ['Aggressive sales language', 'Complex jargon', 'Elitist messaging'],
        examples: ['Every Little Helps', 'Prices that take you further', 'Fresh ideas for busy lives']
    },
    sainsburys: {
        tone: 'Warm, quality-focused, aspirational',
        personality: 'Trusted food expert who cares about taste',
        avoid: ['Discount-heavy messaging', 'Budget language', 'Rushed urgency'],
        examples: ['Taste the Difference', 'Good food costs less', 'Live Well for Less']
    },
    asda: {
        tone: 'Friendly, value-focused, down-to-earth',
        personality: 'Smart shopper who helps families save',
        avoid: ['Pretentious language', 'Premium positioning', 'Complex messaging'],
        examples: ["That's ASDA Price", 'Save money. Live better.', 'Pocket the difference']
    },
    morrisons: {
        tone: 'Fresh, authentic, market heritage',
        personality: 'Traditional grocer with modern values',
        avoid: ['Industrial language', 'Processed messaging', 'Corporate speak'],
        examples: ['More reasons to shop at Morrisons', 'Fresh from Market Street', 'Made by Morrisons']
    },
    aldi: {
        tone: 'Confident, witty, no-nonsense',
        personality: 'Smart challenger who proves quality can be affordable',
        avoid: ['Pretentious claims', 'Excessive marketing speak', 'Apologies for price'],
        examples: ['Like Brands. Only Cheaper.', 'Swap and Save', 'Spend a little, live a lot']
    },
    generic: {
        tone: 'Professional, clear, engaging',
        personality: 'Trustworthy brand that delivers value',
        avoid: ['Excessive punctuation', 'ALL CAPS', 'Clickbait'],
        examples: ['Quality you can taste', 'Made for moments like this', 'Discover the difference']
    }
};

// Platform-specific copy guidelines
const PLATFORM_GUIDELINES = {
    instagram_story: {
        headlineMaxLength: 40,
        ctaMaxLength: 15,
        style: 'Punchy, emoji-friendly, action-oriented',
        examples: ['Swipe Up 👆', 'Shop Now', 'Get Yours']
    },
    facebook_feed: {
        headlineMaxLength: 60,
        ctaMaxLength: 20,
        style: 'Conversational, benefit-focused',
        examples: ['Learn More', 'Shop the Collection', 'See Offers']
    },
    retail_display: {
        headlineMaxLength: 50,
        ctaMaxLength: 25,
        style: 'Bold, clear, immediate impact',
        examples: ['Special Offer', 'Limited Time', 'Great Value']
    }
};

const COPY_SYSTEM_PROMPT = `You are an expert retail copywriter specializing in short-form advertising copy.
Your task is to generate compelling headlines and CTAs that drive action while respecting brand voice.

COPYWRITING PRINCIPLES:
1. Benefit-First - Lead with what the customer gets
2. Action-Oriented - Use strong verbs
3. Brevity - Every word must earn its place
4. Emotional Connection - Tap into feelings, not just features
5. Platform Awareness - Adapt tone to context

You will receive:
- Brand name and voice guidelines
- Product information
- Platform specifications

You must return ONLY valid JSON with this exact structure:
{
  "headlines": [
    "Primary headline option",
    "Alternative headline 1",
    "Alternative headline 2"
  ],
  "ctas": [
    "Primary CTA",
    "Alternative CTA 1",
    "Alternative CTA 2"
  ],
  "tagline": "Optional brand tagline",
  "recommendedHeadline": 0,
  "recommendedCta": 0,
  "reasoning": "Brief explanation of creative direction"
}`;

/**
 * Initialize the Gemini client
 */
function getGeminiClient(apiKey) {
    return new GoogleGenerativeAI(apiKey);
}

/**
 * Get brand voice profile
 */
function getBrandVoice(brand) {
    const normalizedBrand = brand.toLowerCase();
    return BRAND_VOICES[normalizedBrand] || BRAND_VOICES.generic;
}

/**
 * Get platform copy guidelines
 */
function getPlatformGuidelines(platform) {
    return PLATFORM_GUIDELINES[platform] || PLATFORM_GUIDELINES.facebook_feed;
}

/**
 * Generate copy for an ad
 * 
 * @param {Object} params - Copy generation parameters
 * @param {string} params.brand - Brand name
 * @param {string} params.product - Product name/description
 * @param {string} params.platform - Target platform
 * @param {string} params.productBenefits - Key product benefits (optional)
 * @param {string} params.campaignGoal - Campaign objective (optional)
 * @param {string} apiKey - Gemini API key
 * @returns {Object} Generated copy options
 */
export async function generateCopy(params, apiKey) {
    const { brand, product, platform, productBenefits, campaignGoal } = params;

    const brandVoice = getBrandVoice(brand);
    const platformGuide = getPlatformGuidelines(platform);

    try {
        const genAI = getGeminiClient(apiKey);
        const model = genAI.getGenerativeModel({
            model: 'gemini-2.0-flash',
            generationConfig: {
                responseMimeType: 'application/json'
            }
        });

        const prompt = `${COPY_SYSTEM_PROMPT}

CONTEXT:
- Brand: ${brand}
- Brand Voice: ${brandVoice.tone}
- Brand Personality: ${brandVoice.personality}
- Avoid: ${brandVoice.avoid.join(', ')}
- Example Brand Copy: ${brandVoice.examples.join(' | ')}

PRODUCT:
- Name: ${product}
- Benefits: ${productBenefits || 'Quality, freshness, value'}
- Campaign Goal: ${campaignGoal || 'Drive awareness and consideration'}

PLATFORM: ${platform}
- Max Headline Length: ${platformGuide.headlineMaxLength} characters
- Max CTA Length: ${platformGuide.ctaMaxLength} characters
- Style: ${platformGuide.style}
- CTA Examples: ${platformGuide.examples.join(', ')}

Generate compelling copy options. Return ONLY valid JSON.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        const copy = JSON.parse(text);

        return {
            success: true,
            brand,
            platform,
            brandVoice: brandVoice.tone,
            ...copy
        };

    } catch (error) {
        console.error('Copy generation error:', error);

        // Fallback copy
        return {
            success: true,
            brand,
            platform,
            brandVoice: brandVoice.tone,
            headlines: [
                `Discover ${product}`,
                `${product} - Quality You'll Love`,
                `Experience ${product}`
            ],
            ctas: [
                'Shop Now',
                'Learn More',
                'Get Yours'
            ],
            tagline: `${brand} - ${brandVoice.examples[0] || 'Quality Always'}`,
            recommendedHeadline: 0,
            recommendedCta: 0,
            reasoning: 'Fallback copy generated due to API error',
            fallback: true
        };
    }
}

/**
 * Generate copy variations for A/B testing
 */
export async function generateCopyVariations(params, apiKey, count = 3) {
    const variations = [];

    for (let i = 0; i < count; i++) {
        const variation = await generateCopy({
            ...params,
            campaignGoal: params.campaignGoal || `Variation ${i + 1} emphasis`
        }, apiKey);
        variations.push(variation);
    }

    return {
        success: true,
        variations
    };
}

/**
 * Validate copy against brand guidelines
 */
export function validateCopy(copy, brand) {
    const brandVoice = getBrandVoice(brand);
    const issues = [];

    // Check for avoided words/phrases
    brandVoice.avoid.forEach(avoidItem => {
        if (copy.toLowerCase().includes(avoidItem.toLowerCase())) {
            issues.push(`Contains avoided element: "${avoidItem}"`);
        }
    });

    // Check for all caps
    if (copy === copy.toUpperCase() && copy.length > 3) {
        issues.push('Avoid using all caps');
    }

    // Check for excessive punctuation
    if ((copy.match(/!/g) || []).length > 1) {
        issues.push('Reduce exclamation marks');
    }

    return {
        isValid: issues.length === 0,
        issues
    };
}

export { BRAND_VOICES, PLATFORM_GUIDELINES };
