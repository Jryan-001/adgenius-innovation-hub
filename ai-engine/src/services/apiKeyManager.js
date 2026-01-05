/**
 * API Key Manager - Smart Rotation for Multiple Gemini API Keys
 * 
 * Implements intelligent key rotation to avoid rate limits by:
 * 1. Cycling through available keys round-robin
 * 2. Tracking which keys are rate-limited
 * 3. Automatically switching to a healthy key when one fails
 */

class ApiKeyManager {
    constructor() {
        // Load all API keys from environment (supports GEMINI_API_KEY, GEMINI_API_KEY_2, etc.)
        this.keys = [];
        this.keyStatus = new Map(); // Tracks rate limit status per key
        this.currentIndex = 0;

        this.loadKeys();
    }

    loadKeys() {
        // Primary key
        if (process.env.GEMINI_API_KEY) {
            this.keys.push(process.env.GEMINI_API_KEY);
        }

        // Additional keys (GEMINI_API_KEY_2, GEMINI_API_KEY_3, etc.)
        for (let i = 2; i <= 10; i++) {
            const key = process.env[`GEMINI_API_KEY_${i}`];
            if (key) {
                this.keys.push(key);
            }
        }

        // Initialize status for all keys
        this.keys.forEach(key => {
            this.keyStatus.set(key, {
                rateLimitedUntil: null,
                requestCount: 0,
                lastUsed: null
            });
        });

        console.log(`[ApiKeyManager] Loaded ${this.keys.length} API key(s)`);
    }

    /**
     * Get the next available API key
     * Skips rate-limited keys and uses round-robin for load balancing
     */
    getNextKey() {
        if (this.keys.length === 0) {
            throw new Error('No API keys configured. Set GEMINI_API_KEY in .env');
        }

        const now = Date.now();
        let attempts = 0;

        // Try to find a healthy key
        while (attempts < this.keys.length) {
            const key = this.keys[this.currentIndex];
            const status = this.keyStatus.get(key);

            // Check if this key is available
            if (!status.rateLimitedUntil || status.rateLimitedUntil < now) {
                // Clear expired rate limit
                if (status.rateLimitedUntil && status.rateLimitedUntil < now) {
                    status.rateLimitedUntil = null;
                    console.log(`[ApiKeyManager] Key ${this.currentIndex + 1} rate limit expired, now available`);
                }

                // Update usage stats
                status.lastUsed = now;
                status.requestCount++;

                // Rotate to next key for next request (round-robin)
                this.currentIndex = (this.currentIndex + 1) % this.keys.length;

                return key;
            }

            // This key is rate limited, try next
            this.currentIndex = (this.currentIndex + 1) % this.keys.length;
            attempts++;
        }

        // All keys are rate limited - return key with shortest wait time
        let shortestWait = Infinity;
        let bestKey = this.keys[0];

        for (const [key, status] of this.keyStatus) {
            if (status.rateLimitedUntil && status.rateLimitedUntil < shortestWait) {
                shortestWait = status.rateLimitedUntil;
                bestKey = key;
            }
        }

        const waitTime = Math.max(0, shortestWait - now);
        console.log(`[ApiKeyManager] All keys rate limited. Shortest wait: ${Math.ceil(waitTime / 1000)}s`);

        return bestKey;
    }

    /**
     * Mark a key as rate limited
     * @param {string} key - The API key that was rate limited
     * @param {number} waitMs - How long to wait before retrying (default 60s)
     */
    markRateLimited(key, waitMs = 60000) {
        const status = this.keyStatus.get(key);
        if (status) {
            status.rateLimitedUntil = Date.now() + waitMs;
            const keyIndex = this.keys.indexOf(key) + 1;
            console.log(`[ApiKeyManager] Key ${keyIndex} rate limited for ${waitMs / 1000}s`);
        }
    }

    /**
     * Get status of all keys
     */
    getStatus() {
        const now = Date.now();
        return this.keys.map((key, index) => {
            const status = this.keyStatus.get(key);
            const isRateLimited = status.rateLimitedUntil && status.rateLimitedUntil > now;
            return {
                keyIndex: index + 1,
                keyPreview: `${key.substring(0, 10)}...`,
                isHealthy: !isRateLimited,
                requestCount: status.requestCount,
                rateLimitedFor: isRateLimited
                    ? `${Math.ceil((status.rateLimitedUntil - now) / 1000)}s`
                    : null
            };
        });
    }

    /**
     * Get total number of available keys
     */
    getKeyCount() {
        return this.keys.length;
    }
}

// Singleton instance
const apiKeyManager = new ApiKeyManager();

export default apiKeyManager;
