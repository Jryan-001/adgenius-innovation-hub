/**
 * AdGenius AI Assistant
 * 
 * A full-featured AI chat assistant powered by Gemini.
 * Handles any creative task - copywriting, design advice, brainstorming, strategy.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Process any user message with full AI capabilities
 */
export async function processChat(params, apiKey) {
  const { message, canvasState, brand, platform, chatHistory = [] } = params;

  const genAI = new GoogleGenerativeAI(apiKey);

  // Dynamic model selection - configurable via env
  const modelName = process.env.GEMINI_MODEL || 'gemini-2.0-flash';

  const model = genAI.getGenerativeModel({
    model: modelName,
    generationConfig: {
      temperature: 0.8,
      maxOutputTokens: 4096,
    }
  });

  // Build conversation context
  const historyText = chatHistory.length > 0
    ? chatHistory.slice(-10).map(m => `${m.role === 'user' ? 'User' : 'AdGenius'}: ${m.content}`).join('\n\n')
    : '';

  const prompt = `You are AdGenius, a creative AI assistant. Be concise and helpful.

RULES:
- Keep responses SHORT (2-3 sentences)
- Use bullet points for lists
- Be friendly but brief ✨

CONTEXT: ${brand || 'Tesco'} ad for ${platform || 'Instagram'}.

${historyText ? `Previous:\n${historyText}\n` : ''}

User: ${message}

WHEN USER WANTS DESIGN CHANGES, add this at the end:
[ACTIONS]{"actions":[{"type":"layout","target":"logo","changes":{"scale":1.5}}]}[/ACTIONS]

Examples:
- "Make logo bigger" → type:"layout", target:"logo", changes:{scale:1.5}
- "Change headline" → type:"copy", target:"headline", changes:{text:"New Text"}
- "Use warmer colors" → type:"color", target:"palette", changes:{primary:"#FF6B35"}
- "Pink background" → type:"color", target:"palette", changes:{background:"#FFB6C1"}
- "Center the product" → type:"layout", target:"packshot", changes:{x:0.5,y:0.5}

Respond:`;

  try {
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
    console.error('AI Chat error:', error);

    // Check if it's a quota error
    const isQuotaError = error.message?.includes('429') || error.message?.includes('quota');

    let userMessage;
    if (isQuotaError) {
      userMessage = "⏳ I need a quick breather! Too many requests. Please wait 30 seconds and try again.";
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
}

/**
 * Generate creative content
 */
export async function generateCreativeContent(params, apiKey) {
  const { type, brand, product, platform } = params;

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const prompts = {
    headlines: `Generate 10 creative headline options for a ${brand} ad featuring ${product}. Platform: ${platform}. Include benefit-focused, emotional, clever, and direct styles.`,
    ctas: `Generate 8 compelling CTAs for a ${brand} ${product} ad. Keep each under 4 words.`,
    campaign: `Brainstorm 5 campaign concepts for ${brand}'s ${product}. Include name, message, visual direction, target audience.`
  };

  try {
    const result = await model.generateContent(prompts[type] || prompts.headlines);
    return { success: true, type, content: result.response.text() };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Get AI design feedback
 */
export async function getDesignFeedback(params, apiKey) {
  const { canvasState, brand, platform } = params;

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const prompt = `Analyze this ${brand} ad for ${platform} and provide specific feedback:
Elements: ${JSON.stringify(canvasState?.elements || [])}
Colors: ${JSON.stringify(canvasState?.palette || {})}

Evaluate: hierarchy, colors, typography, CTA, overall impact.`;

  try {
    const result = await model.generateContent(prompt);
    return { success: true, feedback: result.response.text() };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Brainstorm ideas
 */
export async function brainstorm(params, apiKey) {
  const { topic, brand, count = 10 } = params;

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    generationConfig: { temperature: 0.9 }
  });

  try {
    const result = await model.generateContent(
      `Brainstorm ${count} creative ideas for ${brand} about: ${topic}. Include safe concepts and bold ideas.`
    );
    return { success: true, ideas: result.response.text() };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export { processChat as default };
