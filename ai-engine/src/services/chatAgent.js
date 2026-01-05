/**
 * AdGenius AI Assistant - ENHANCED
 * 
 * Comprehensive AI assistant for AdGenius Innovation Hub.
 * Understands the full product context and can help with any ad creation task.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Comprehensive AdGenius system prompt with COMPLETE AD GENERATION capability
 */
const ADGENIUS_SYSTEM_PROMPT = `You are AdGenius AI - a professional ad design assistant that creates stunning advertisements.

## YOUR SUPERPOWER: COMPLETE AD GENERATION
When users ask to "create an ad", "design an ad", "make a poster", etc., you generate a COMPLETE PROFESSIONAL LAYOUT with:
- Perfect background colors/gradients
- Hero images positioned correctly
- Eye-catching headlines
- Supporting text
- Call-to-action buttons
- Professional spacing and alignment

## AVAILABLE ACTIONS:

### 1. GENERATE COMPLETE AD LAYOUT (for "create ad", "design poster", "make banner"):
{
  "type": "generate_layout",
  "data": {
    "theme": "modern|warm|cool|vibrant|minimal|luxury|playful",
    "background": {"type": "solid|gradient", "colors": ["#hexcode"]},
    "elements": [
      {"type": "image", "searchQuery": "descriptive image search", "position": "center|top|bottom", "size": "large|medium|small"},
      {"type": "headline", "text": "Catchy Headline", "position": "top|center|bottom"},
      {"type": "subheadline", "text": "Supporting text"},
      {"type": "cta", "text": "Call To Action", "color": "#hexcode"}
    ]
  }
}

EXAMPLE - User: "Create a coffee shop ad"
Response: "Creating a warm, inviting coffee shop ad! ☕✨
[ACTIONS]{"actions":[{"type":"generate_layout","data":{"theme":"warm","background":{"type":"gradient","colors":["#2c1810","#5c3d2e"]},"elements":[{"type":"image","searchQuery":"coffee cup latte art steam cozy cafe","position":"center","size":"large"},{"type":"headline","text":"Wake Up to Perfection","position":"top"},{"type":"subheadline","text":"Freshly brewed just for you"},{"type":"cta","text":"Order Now","color":"#D4A574"}]}}]}[/ACTIONS]"

EXAMPLE - User: "Make a sale banner for electronics"
Response: "Designing an eye-catching electronics sale banner! 🔥
[ACTIONS]{"actions":[{"type":"generate_layout","data":{"theme":"vibrant","background":{"type":"gradient","colors":["#1a1a2e","#16213e"]},"elements":[{"type":"image","searchQuery":"modern smartphone laptop electronics tech gadgets","position":"center","size":"large"},{"type":"headline","text":"MEGA SALE","position":"top"},{"type":"subheadline","text":"Up to 70% off on all electronics"},{"type":"cta","text":"Shop Now","color":"#e94560"}]}}]}[/ACTIONS]"

EXAMPLE - User: "Design a fitness gym poster"
Response: "Creating a powerful fitness poster! 💪
[ACTIONS]{"actions":[{"type":"generate_layout","data":{"theme":"vibrant","background":{"type":"gradient","colors":["#232526","#414345"]},"elements":[{"type":"image","searchQuery":"fitness gym workout person exercising strong","position":"center","size":"large"},{"type":"headline","text":"Transform Your Body","position":"top"},{"type":"subheadline","text":"Join the strongest community"},{"type":"cta","text":"Start Free Trial","color":"#00b894"}]}}]}[/ACTIONS]"

### 2. ADD SINGLE IMAGE:
{"type":"add_image","data":{"searchQuery":"descriptive search","alt":"Description","width":200,"height":200,"top":200,"left":200}}

### 3. SET IMAGE AS BACKGROUND (stretches to fill canvas):
{"type":"set_background_image","data":{"searchQuery":"coffee beans texture background"}}
Use when user says: "set as background", "use as background", "stretch to fill", "fill the canvas with"

### 4. MODIFY SELECTED ELEMENT:
{"type":"modify_selected","data":{"action":"set_as_background|stretch_to_fill|delete|bring_to_front|send_to_back"}}
Use when user refers to "this image", "the selected", "make this bigger", "stretch this"

### 5. ADD TEXT:
{"type":"add_text","data":{"text":"Your Text","fontSize":48,"fontWeight":"bold","fill":"#FFFFFF","top":100,"left":100}}

### 6. ADD SHAPE:
{"type":"add_shape","data":{"shape":"rectangle|circle|triangle","fill":"#FF5733","width":200,"height":100}}

### 7. CHANGE BACKGROUND COLOR:
{"type":"color","target":"palette","changes":{"background":"#1E1E2E"}}

## SMART INTERPRETATION:
- "Create an ad for..." → Use generate_layout with appropriate theme
- "Design a poster..." → Use generate_layout
- "Make a banner..." → Use generate_layout
- "Add chocolate" → Use add_image
- "Put some text" → Use add_text
- "Change background color" → Use color action
- "Set this as background" → Use modify_selected with action: "set_as_background"
- "Add coffee beans as background" → Use set_background_image
- "Stretch to fill" → Use modify_selected with action: "stretch_to_fill"

## RESPONSE FORMAT:
1. Brief exciting acknowledgment
2. [ACTIONS] block with the layout/changes

## CONTEXT:
- Brand: {brand}
- Platform: {platform}
- Canvas: {canvasDescription}

## RULES:
1. For ANY "create/design/make ad/poster/banner" → Use generate_layout
2. For "add X as background" → Use set_background_image to fetch and set as full background
3. For "set selected/this as background" → Use modify_selected with action: "set_as_background"
4. Generate complete, professional layouts - not just single elements
5. ALWAYS include [ACTIONS] for any visual request`;



/**
 * Process any user message with full AI capabilities and product context
 * Uses smart API key rotation to avoid rate limits
 */
export async function processChat(params, apiKey) {
  const { message, canvasState, brand, platform, chatHistory = [] } = params;

  // Import the key manager dynamically to avoid circular deps
  const apiKeyManager = (await import('./apiKeyManager.js')).default;

  // Build canvas description for context
  const canvasDescription = canvasState?.elements?.length > 0
    ? `${canvasState.elements.length} elements including: ${canvasState.elements.map(e => e.type).join(', ')}`
    : 'Empty canvas';

  // Build conversation context with recent history
  const historyText = chatHistory.length > 0
    ? chatHistory.slice(-10).map(m => `${m.role === 'user' ? 'User' : 'AdGenius'}: ${m.content}`).join('\n\n')
    : '';

  // Construct the full prompt with product context
  const systemPrompt = ADGENIUS_SYSTEM_PROMPT
    .replace('{brand}', brand || 'Generic Brand')
    .replace('{platform}', platform || 'Instagram Story')
    .replace('{canvasDescription}', canvasDescription);

  const prompt = `${systemPrompt}

---
${historyText ? `CONVERSATION HISTORY:\n${historyText}\n\n---\n` : ''}
USER MESSAGE: ${message}

YOUR RESPONSE:`;

  // Try with multiple keys if rate limited
  const maxRetries = apiKeyManager.getKeyCount();
  let lastError = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const currentKey = apiKeyManager.getNextKey();

    try {
      const genAI = new GoogleGenerativeAI(currentKey);
      const modelName = process.env.GEMINI_MODEL || 'gemini-pro';

      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
          temperature: 0.8,
          maxOutputTokens: 4096,
        }
      });

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();

      // Parse for actions if present
      let actions = [];
      let cleanMessage = responseText;

      // Always remove the ACTIONS block from message first
      cleanMessage = responseText.replace(/\[ACTIONS\][\s\S]*?\[\/ACTIONS\]/g, '').trim();

      const actionsMatch = responseText.match(/\[ACTIONS\]([\s\S]*?)\[\/ACTIONS\]/);
      if (actionsMatch) {
        try {
          // Try to fix common JSON issues
          let jsonStr = actionsMatch[1].trim();
          // Fix extra closing braces
          jsonStr = jsonStr.replace(/\}\}\}/g, '}}').replace(/\]\]\]/g, ']]');
          // Fix missing quotes on property names
          jsonStr = jsonStr.replace(/(\{|,)\s*(\w+):/g, '$1"$2":');

          const parsed = JSON.parse(jsonStr);
          if (parsed.actions) {
            actions = parsed.actions;
          }
        } catch (e) {
          console.error('JSON parse error:', e.message, actionsMatch[1]);
        }
      }

      return {
        success: true,
        message: cleanMessage,
        actions: actions,
        suggestions: [],
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      lastError = error;
      console.error(`AI Chat error (attempt ${attempt + 1}/${maxRetries}):`, error.message);

      // Check if it's a quota error
      const isQuotaError = error.message?.includes('429') ||
        error.message?.includes('quota') ||
        error.message?.includes('RESOURCE_EXHAUSTED');

      if (isQuotaError) {
        // Mark this key as rate limited (60 seconds cooldown)
        apiKeyManager.markRateLimited(currentKey, 60000);
        console.log(`[ChatAgent] Key rate limited, trying next key...`);

        // Continue to next key
        continue;
      } else {
        // Non-quota error, don't retry
        break;
      }
    }
  }

  // All retries exhausted or non-quota error
  const isQuotaError = lastError?.message?.includes('429') ||
    lastError?.message?.includes('quota') ||
    lastError?.message?.includes('RESOURCE_EXHAUSTED');

  let userMessage;
  if (isQuotaError) {
    userMessage = "⏳ All API keys are currently busy. Please wait a moment and try again.";
  } else {
    userMessage = "Oops! Something went wrong. Please try again in a moment.";
  }

  return {
    success: false,
    message: userMessage,
    actions: [],
    suggestions: ["Try again in 30 seconds"],
    timestamp: new Date().toISOString()
  };
}

/**
 * Generate creative content with AdGenius context
 */

export async function generateCreativeContent(params, apiKey) {
  const { type, brand, product, platform } = params;

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const prompts = {
    headlines: `You are AdGenius, a creative advertising AI. Generate 10 creative headline options for a ${brand} ad featuring ${product}. Platform: ${platform}. 
    
Include:
- 2 benefit-focused headlines
- 2 emotional/aspirational headlines
- 2 clever/witty headlines
- 2 direct/promotional headlines
- 2 question-based headlines

Keep each headline under 10 words. Format as a numbered list.`,

    ctas: `You are AdGenius, a creative advertising AI. Generate 8 compelling CTAs for a ${brand} ${product} ad on ${platform}.

Include:
- 2 action-oriented CTAs
- 2 urgency-based CTAs
- 2 benefit-focused CTAs
- 2 curiosity-driven CTAs

Keep each under 4 words. Format as a numbered list.`,

    campaign: `You are AdGenius, a creative advertising AI. Brainstorm 5 campaign concepts for ${brand}'s ${product}.

For each concept, provide:
- **Campaign Name**: Creative title
- **Core Message**: One sentence
- **Visual Direction**: Brief description
- **Target Audience**: Who it appeals to
- **Key Platforms**: Best channels`
  };

  try {
    const result = await model.generateContent(prompts[type] || prompts.headlines);
    return { success: true, type, content: result.response.text() };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Get AI design feedback with AdGenius expertise
 */
export async function getDesignFeedback(params, apiKey) {
  const { canvasState, brand, platform } = params;

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const prompt = `You are AdGenius, an expert ad design critic. Analyze this ${brand} ad for ${platform} and provide specific, actionable feedback.

Current Design:
- Elements: ${JSON.stringify(canvasState?.elements || [])}
- Colors: ${JSON.stringify(canvasState?.palette || {})}

Evaluate these aspects (rate each 1-10):
1. **Visual Hierarchy**: Is the most important message obvious?
2. **Color Harmony**: Do colors work together and match the brand?
3. **Typography**: Is text readable and properly styled?
4. **CTA Clarity**: Is the call-to-action prominent and compelling?
5. **Overall Impact**: Would this stop a scrolling user?

For each aspect, provide:
- Score (1-10)
- Specific issue (if any)
- Actionable improvement suggestion

End with 3 quick wins that would most improve this ad.`;

  try {
    const result = await model.generateContent(prompt);
    return { success: true, feedback: result.response.text() };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Brainstorm ideas with AdGenius creativity
 */
export async function brainstorm(params, apiKey) {
  const { topic, brand, count = 10 } = params;

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    generationConfig: { temperature: 0.95 } // Higher creativity
  });

  try {
    const result = await model.generateContent(
      `You are AdGenius, a wildly creative advertising AI. Brainstorm ${count} creative ideas for ${brand} about: ${topic}.

Generate a mix:
- 4 safe, proven concepts that work
- 4 bold, innovative ideas that stand out
- 2 completely unexpected, disruptive concepts

For each idea, provide:
- **Concept Name**
- **Core Idea** (1 sentence)
- **Why It Works** (brief rationale)

Be creative, be bold, push boundaries!`
    );
    return { success: true, ideas: result.response.text() };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export { processChat as default };
