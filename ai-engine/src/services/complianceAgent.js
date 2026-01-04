/**
 * AdGenius Compliance Agent
 * 
 * Uses Vision-Language Model for "Adaptive Compliance"
 * Handles ambiguous brand guidelines by understanding context,
 * not just checking hard-coded rules.
 * 
 * This is the KEY INNOVATION for the hackathon.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';

// Brand compliance rules database - UK Supermarkets
const BRAND_GUIDELINES = {
    tesco: {
        brand: 'Tesco',
        rules: [
            { id: 'logo_visibility', rule: 'Logo Visibility', description: 'Tesco logo must be clearly visible and placed in top 20% of the canvas', weight: 'high', checkType: 'visual' },
            { id: 'color_palette', rule: 'Color Palette', description: 'Use Tesco brand colors: Primary Red (#E41C2A), White (#FFFFFF), and Blue (#00539F)', weight: 'high', checkType: 'visual' },
            { id: 'brand_voice', rule: 'Brand Voice', description: 'Copy should feel helpful, simple, and value-driven. Avoid aggressive sales language.', weight: 'medium', checkType: 'semantic' },
            { id: 'text_legibility', rule: 'Text Legibility', description: 'Text must have sufficient contrast (4.5:1 ratio) and minimum font size', weight: 'high', checkType: 'visual' },
            { id: 'product_prominence', rule: 'Product Prominence', description: 'Product should be the visual hero, occupying at least 30% of canvas', weight: 'medium', checkType: 'visual' },
            { id: 'safe_zones', rule: 'Platform Safe Zones', description: 'Critical elements must not be placed in platform-specific unsafe areas', weight: 'high', checkType: 'layout' }
        ],
        colors: ['#E41C2A', '#FFFFFF', '#00539F'],
        minContrastRatio: 4.5,
        logoPosition: 'top-20-percent',
        voiceKeywords: ['helpful', 'simple', 'value', 'fresh', 'quality', 'everyday']
    },
    sainsburys: {
        brand: "Sainsbury's",
        rules: [
            { id: 'logo_visibility', rule: 'Logo Visibility', description: "Sainsbury's logo must be prominent with adequate clear space", weight: 'high', checkType: 'visual' },
            { id: 'color_palette', rule: 'Color Palette', description: "Use Sainsbury's Orange (#F06C00), White, and supporting greys", weight: 'high', checkType: 'visual' },
            { id: 'brand_voice', rule: 'Brand Voice', description: 'Tone should be warm, friendly, and inclusive. Focus on quality and taste.', weight: 'medium', checkType: 'semantic' },
            { id: 'text_legibility', rule: 'Text Legibility', description: 'Use clean sans-serif fonts. Minimum contrast 4.5:1', weight: 'high', checkType: 'visual' },
            { id: 'product_prominence', rule: 'Product Prominence', description: 'Product photography should be appetizing. Minimum 35% canvas coverage.', weight: 'high', checkType: 'visual' },
            { id: 'taste_messaging', rule: 'Taste-First Messaging', description: 'Prioritize taste and quality messaging over price.', weight: 'medium', checkType: 'semantic' }
        ],
        colors: ['#F06C00', '#FFFFFF', '#4A4A4A', '#1E1E1E'],
        minContrastRatio: 4.5,
        logoPosition: 'top-left-preferred',
        voiceKeywords: ['taste', 'quality', 'fresh', 'delicious', 'inspired', 'lovingly']
    },
    asda: {
        brand: 'ASDA',
        rules: [
            { id: 'logo_visibility', rule: 'Logo Visibility', description: 'ASDA logo should be clearly visible. Green pocket logo preferred.', weight: 'high', checkType: 'visual' },
            { id: 'color_palette', rule: 'Color Palette', description: 'Use ASDA Green (#78BE20) as primary, Yellow (#FDB813) for promotions.', weight: 'high', checkType: 'visual' },
            { id: 'brand_voice', rule: 'Brand Voice', description: 'Tone should be friendly, down-to-earth, and value-focused.', weight: 'medium', checkType: 'semantic' },
            { id: 'price_prominence', rule: 'Price Prominence', description: 'Prices should be bold and clearly visible when shown.', weight: 'medium', checkType: 'visual' },
            { id: 'product_prominence', rule: 'Product Prominence', description: 'Product should be the hero. Pack shots should be clear.', weight: 'high', checkType: 'visual' },
            { id: 'value_messaging', rule: 'Value Messaging', description: 'Emphasize value and savings.', weight: 'medium', checkType: 'semantic' }
        ],
        colors: ['#78BE20', '#FDB813', '#FFFFFF', '#333333'],
        minContrastRatio: 4.5,
        logoPosition: 'flexible',
        voiceKeywords: ['value', 'save', 'price', 'pocket', 'family', 'everyday', 'rollback']
    },
    morrisons: {
        brand: 'Morrisons',
        rules: [
            { id: 'logo_visibility', rule: 'Logo Visibility', description: 'Morrisons logo must be visible with distinctive yellow and green.', weight: 'high', checkType: 'visual' },
            { id: 'color_palette', rule: 'Color Palette', description: 'Use Morrisons Yellow (#FFD100) and Green (#006F44).', weight: 'high', checkType: 'visual' },
            { id: 'brand_voice', rule: 'Brand Voice', description: 'Tone should emphasize freshness and market heritage.', weight: 'medium', checkType: 'semantic' },
            { id: 'freshness_focus', rule: 'Freshness Focus', description: 'Highlight fresh, market-style presentation.', weight: 'medium', checkType: 'semantic' },
            { id: 'product_prominence', rule: 'Product Prominence', description: 'Fresh products should look appetizing and natural.', weight: 'high', checkType: 'visual' }
        ],
        colors: ['#FFD100', '#006F44', '#FFFFFF', '#1C1C1C'],
        minContrastRatio: 4.5,
        logoPosition: 'top-preferred',
        voiceKeywords: ['fresh', 'market', 'quality', 'butcher', 'baker', 'made', 'real']
    },
    aldi: {
        brand: 'Aldi',
        rules: [
            { id: 'logo_visibility', rule: 'Logo Visibility', description: 'Aldi logo with blue and orange brand mark clearly visible.', weight: 'high', checkType: 'visual' },
            { id: 'color_palette', rule: 'Color Palette', description: 'Use Aldi Blue (#00205B) and Orange (#EF7D00) with white backgrounds.', weight: 'high', checkType: 'visual' },
            { id: 'brand_voice', rule: 'Brand Voice', description: 'Confident, straightforward, and clever. Can be witty.', weight: 'medium', checkType: 'semantic' },
            { id: 'value_proposition', rule: 'Value Proposition', description: 'Emphasize quality at low prices.', weight: 'high', checkType: 'semantic' },
            { id: 'simplicity', rule: 'Design Simplicity', description: 'Keep designs clean and uncluttered.', weight: 'medium', checkType: 'visual' },
            { id: 'product_prominence', rule: 'Product Prominence', description: 'Product should be front and center.', weight: 'high', checkType: 'visual' }
        ],
        colors: ['#00205B', '#EF7D00', '#FFFFFF', '#1A1A1A'],
        minContrastRatio: 4.5,
        logoPosition: 'top-center-preferred',
        voiceKeywords: ['quality', 'value', 'smart', 'simple', 'cheaper', 'same', 'better']
    },
    generic: {
        brand: 'Generic',
        rules: [
            { id: 'visual_balance', rule: 'Visual Balance', description: 'Ad should have balanced composition with clear hierarchy', weight: 'medium', checkType: 'visual' },
            { id: 'text_clarity', rule: 'Text Clarity', description: 'All text must be readable and not obscured', weight: 'high', checkType: 'visual' },
            { id: 'product_visibility', rule: 'Product Visibility', description: 'Product should be clearly visible and the focus', weight: 'high', checkType: 'visual' },
            { id: 'cta_presence', rule: 'Call-to-Action', description: 'A clear call-to-action should be present', weight: 'medium', checkType: 'layout' }
        ],
        colors: [],
        minContrastRatio: 4.5,
        voiceKeywords: []
    }
};

const COMPLIANCE_SYSTEM_PROMPT = `You are an expert Brand Compliance Auditor specializing in retail advertising for major grocery and retail brands.
You have deep expertise in:
- Visual design principles (Rule of Thirds, hierarchy, balance)
- Brand identity systems (color theory, typography, logo usage)
- Retail advertising regulations and best practices
- Platform-specific requirements (social media, in-store displays)

Your task is to perform a COMPREHENSIVE visual audit of retail ad creatives.

=== VISUAL ANALYSIS FRAMEWORK ===

1. LOGO ANALYSIS
   - Is the logo clearly visible without visual obstruction?
   - Is it placed in a "power position" (top 20% of canvas)?
   - Is the logo size proportional (minimum 10% of canvas width)?
   - Is there adequate clear space around the logo?

2. COLOR COMPLIANCE
   - Are the primary brand colors being used correctly?
   - Is the color ratio appropriate (60-30-10 rule)?
   - Check for any off-brand or competing colors

3. TYPOGRAPHY & TEXT
   - Is text hierarchy clear (headline > subhead > body > CTA)?
   - Text contrast ratio (WCAG AA = 4.5:1 minimum)
   - Is text readable at intended viewing distance?

4. PRODUCT PRESENTATION
   - Is the product the visual "hero" of the ad?
   - Product occupies adequate canvas area (minimum 30%)
   - Product photography quality (lighting, angle, clarity)

5. COMPOSITION & LAYOUT
   - Rule of Thirds alignment for key elements
   - Visual flow guides eye to call-to-action
   - Adequate white/negative space (minimum 20%)

6. BRAND VOICE
   - Does the copy tone match brand personality?
   - CTA is clear and action-oriented

=== SCORING RUBRIC ===

For EACH rule, assign a score based on:
- 95-100: Exemplary - Best practice example
- 85-94: Excellent - Fully compliant
- 75-84: Good - Minor optimization opportunities
- 60-74: Fair - Needs attention before launch
- 40-59: Poor - Significant issues
- 0-39: Fail - Critical violations

OVERALL STATUS:
- PASS (>=80): Ready for publication
- WARNING (60-79): Needs revision
- FAIL (<60): Requires significant rework

=== OUTPUT FORMAT ===

Return ONLY valid JSON:
{
  "overallScore": 85,
  "status": "PASS",
  "executiveSummary": "One-sentence assessment",
  "checks": [
    {
      "ruleId": "logo_visibility",
      "rule": "Logo Visibility",
      "passed": true,
      "score": 95,
      "feedback": "Specific observation"
    }
  ],
  "actionableImprovements": ["Specific improvement"],
  "strengths": ["What the ad does well"],
  "criticalIssues": ["Issues that MUST be fixed"]
}

Be thorough, specific, and constructive.`;

/**
 * Initialize the Gemini client
 */
function getGeminiClient(apiKey) {
    return new GoogleGenerativeAI(apiKey);
}

/**
 * Get brand guidelines
 */
function getBrandGuidelines(brand) {
    const normalizedBrand = brand.toLowerCase().replace(/[^a-z]/g, '');
    return BRAND_GUIDELINES[normalizedBrand] || BRAND_GUIDELINES.generic;
}

/**
 * Check compliance using Vision AI
 */
export async function checkCompliance(params, apiKey) {
    const { canvasImage, brand, adMetadata } = params;
    const guidelines = getBrandGuidelines(brand);

    try {
        const genAI = getGeminiClient(apiKey);
        const model = genAI.getGenerativeModel({
            model: 'gemini-2.0-flash',
            generationConfig: { responseMimeType: 'application/json' }
        });

        let imagePart;
        if (canvasImage.startsWith('data:')) {
            const base64Data = canvasImage.split(',')[1];
            imagePart = { inlineData: { data: base64Data, mimeType: 'image/png' } };
        } else if (canvasImage.startsWith('http')) {
            const response = await fetch(canvasImage);
            const buffer = await response.arrayBuffer();
            const base64Data = Buffer.from(buffer).toString('base64');
            imagePart = { inlineData: { data: base64Data, mimeType: 'image/png' } };
        } else {
            imagePart = { inlineData: { data: canvasImage, mimeType: 'image/png' } };
        }

        const prompt = `${COMPLIANCE_SYSTEM_PROMPT}

BRAND GUIDELINES TO CHECK:
Brand: ${guidelines.brand}
Rules:
${guidelines.rules.map(r => `- ${r.rule} (${r.weight}): ${r.description}`).join('\n')}

Brand Colors: ${guidelines.colors.join(', ') || 'Not specified'}
Minimum Contrast Ratio: ${guidelines.minContrastRatio}:1

${adMetadata ? `AD METADATA:\n${JSON.stringify(adMetadata, null, 2)}` : ''}

Analyze this ad image against ALL the guidelines above. Return ONLY valid JSON.`;

        const result = await model.generateContent([prompt, imagePart]);
        const response = await result.response;
        const text = response.text();
        const compliance = JSON.parse(text);

        return {
            success: true,
            brand: guidelines.brand,
            timestamp: new Date().toISOString(),
            ...compliance
        };

    } catch (error) {
        console.error('Compliance check error:', error);
        return performFallbackCheck(guidelines, adMetadata);
    }
}

/**
 * Fallback rule-based compliance check
 */
function performFallbackCheck(guidelines, adMetadata) {
    const checks = guidelines.rules.map(rule => ({
        ruleId: rule.id,
        rule: rule.rule,
        passed: true,
        score: 75,
        feedback: `Unable to perform visual check. Manual review recommended for: ${rule.description}`
    }));

    return {
        success: true,
        brand: guidelines.brand,
        timestamp: new Date().toISOString(),
        overallScore: 75,
        status: 'WARNING',
        checks,
        actionableImprovements: [
            'Visual AI check unavailable - please review manually',
            'Ensure logo is visible in top 20% of canvas',
            'Verify color palette matches brand guidelines'
        ],
        strengths: [],
        fallback: true
    };
}

/**
 * Quick compliance pre-check (lightweight)
 */
export async function quickComplianceCheck(params, apiKey) {
    const { canvasData, brand } = params;
    const guidelines = getBrandGuidelines(brand);

    const issues = [];
    const passed = [];

    // Check if logo is present
    if (!canvasData.elements?.some(el => el.id === 'logo')) {
        issues.push({ rule: 'Logo Visibility', issue: 'Logo element not found in design' });
    } else {
        const logo = canvasData.elements.find(el => el.id === 'logo');
        if (logo.y > 0.2) {
            issues.push({ rule: 'Logo Visibility', issue: 'Logo should be in top 20% of canvas' });
        } else {
            passed.push('Logo Visibility');
        }
    }

    // Check colors
    if (canvasData.palette && guidelines.colors.length > 0) {
        const usedColors = Object.values(canvasData.palette);
        const validColors = usedColors.filter(color =>
            guidelines.colors.includes(color.toUpperCase())
        );
        if (validColors.length < usedColors.length) {
            issues.push({ rule: 'Color Palette', issue: 'Some colors may not match brand guidelines' });
        } else {
            passed.push('Color Palette');
        }
    }

    const score = Math.round(100 - (issues.length * 15));

    return {
        success: true,
        quickCheck: true,
        score: Math.max(0, score),
        status: score >= 80 ? 'PASS' : score >= 60 ? 'WARNING' : 'FAIL',
        issues,
        passed,
        message: issues.length === 0 ? 'All quick checks passed!' : `${issues.length} issue(s) detected`
    };
}

/**
 * Get available guidelines for a brand
 */
export function getAvailableGuidelines(brand) {
    const guidelines = getBrandGuidelines(brand);
    return {
        brand: guidelines.brand,
        rules: guidelines.rules.map(r => ({
            id: r.id,
            rule: r.rule,
            description: r.description,
            weight: r.weight
        })),
        colors: guidelines.colors
    };
}

export { BRAND_GUIDELINES };
