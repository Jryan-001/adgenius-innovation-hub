/**
 * API Service for AI Engine Communication
 */

const AI_URL = import.meta.env.VITE_AI_URL || 'http://localhost:3001';

/**
 * Chat with AI Assistant
 */
export async function chat({ message, canvasState, brand, platform, chatHistory }) {
    const response = await fetch(`${AI_URL}/api/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, canvasState, brand, platform, chatHistory })
    });
    return response.json();
}

/**
 * Generate AI Layout
 */
export async function generateLayout({ brand, product, platform }) {
    const response = await fetch(`${AI_URL}/api/ai/generate-layout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brand, product, platform })
    });
    return response.json();
}

/**
 * Generate Copy (Headlines, CTAs)
 */
export async function generateCopy({ brand, product, platform }) {
    const response = await fetch(`${AI_URL}/api/ai/generate-copy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brand, product, platform })
    });
    return response.json();
}

/**
 * Generate Complete Ad
 */
export async function generateAd({ brand, product, platform }) {
    const response = await fetch(`${AI_URL}/api/ai/generate-ad`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brand, product, platform })
    });
    return response.json();
}

/**
 * Check Compliance
 */
export async function checkCompliance({ canvasData, brand }) {
    const response = await fetch(`${AI_URL}/api/ai/quick-compliance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ canvasData, brand })
    });
    return response.json();
}

/**
 * Export Ad
 */
export async function exportAd({ canvasData, formats }) {
    const response = await fetch(`${AI_URL}/api/ai/export`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ canvasData, formats })
    });
    return response.json();
}
