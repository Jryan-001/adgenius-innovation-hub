/**
 * API Service for Backend Communication
 * 
 * All requests now route through the backend (port 3000)
 * which proxies AI requests to the AI Engine (port 3001)
 */

const API_URL = import.meta.env.VITE_AI_URL || 'http://localhost:3000';

// ============================================
// AI ENDPOINTS (proxied through backend)
// ============================================

/**
 * Chat with AI Assistant
 */
export async function chat({ message, canvasState, brand, platform, chatHistory }) {
    const response = await fetch(`${API_URL}/api/ai/chat`, {
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
    const response = await fetch(`${API_URL}/api/ai/generate-layout`, {
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
    const response = await fetch(`${API_URL}/api/ai/generate-copy`, {
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
    const response = await fetch(`${API_URL}/api/ai/generate-ad`, {
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
    const response = await fetch(`${API_URL}/api/ai/quick-compliance`, {
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
    const response = await fetch(`${API_URL}/api/ai/export`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ canvasData, formats })
    });
    return response.json();
}

// ============================================
// PROJECT ENDPOINTS (MongoDB when connected)
// ============================================

/**
 * Get all projects
 */
export async function getProjects() {
    try {
        const response = await fetch(`${API_URL}/api/projects`);
        const data = await response.json();
        return data.projects || [];
    } catch (error) {
        console.warn('Backend projects unavailable, using localStorage');
        return JSON.parse(localStorage.getItem('adgen_projects') || '[]');
    }
}

/**
 * Get single project by ID
 */
export async function getProject(id) {
    try {
        const response = await fetch(`${API_URL}/api/projects/${id}`);
        if (!response.ok) throw new Error('Project not found');
        return response.json();
    } catch (error) {
        console.warn('Backend unavailable, checking localStorage');
        const projects = JSON.parse(localStorage.getItem('adgen_projects') || '[]');
        return projects.find(p => p.id === id || p._id === id);
    }
}

/**
 * Create new project
 */
export async function createProject(projectData) {
    try {
        const response = await fetch(`${API_URL}/api/projects`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(projectData)
        });
        return response.json();
    } catch (error) {
        console.warn('Backend unavailable, saving to localStorage');
        const projects = JSON.parse(localStorage.getItem('adgen_projects') || '[]');
        const newProject = { ...projectData, id: Date.now().toString(), createdAt: new Date().toISOString() };
        projects.push(newProject);
        localStorage.setItem('adgen_projects', JSON.stringify(projects));
        return newProject;
    }
}

/**
 * Update project
 */
export async function updateProject(id, projectData) {
    try {
        const response = await fetch(`${API_URL}/api/projects/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(projectData)
        });
        return response.json();
    } catch (error) {
        console.warn('Backend unavailable, updating localStorage');
        const projects = JSON.parse(localStorage.getItem('adgen_projects') || '[]');
        const index = projects.findIndex(p => p.id === id || p._id === id);
        if (index !== -1) {
            projects[index] = { ...projects[index], ...projectData, updatedAt: new Date().toISOString() };
            localStorage.setItem('adgen_projects', JSON.stringify(projects));
            return projects[index];
        }
        return null;
    }
}

/**
 * Delete project
 */
export async function deleteProject(id) {
    try {
        const response = await fetch(`${API_URL}/api/projects/${id}`, {
            method: 'DELETE'
        });
        return response.json();
    } catch (error) {
        console.warn('Backend unavailable, deleting from localStorage');
        const projects = JSON.parse(localStorage.getItem('adgen_projects') || '[]');
        const filtered = projects.filter(p => p.id !== id && p._id !== id);
        localStorage.setItem('adgen_projects', JSON.stringify(filtered));
        return { success: true };
    }
}

// ============================================
// BRAND ENDPOINTS
// ============================================

/**
 * Get all brands
 */
export async function getBrands() {
    try {
        const response = await fetch(`${API_URL}/api/brands`);
        const data = await response.json();
        return data.brands || [];
    } catch (error) {
        console.warn('Backend unavailable, returning default brand');
        return [{
            name: 'Tesco',
            slug: 'tesco',
            colors: ['#E41C2A', '#FFFFFF', '#00539F'],
            voiceDescription: 'Helpful, simple, value-driven'
        }];
    }
}

/**
 * Get single brand by slug
 */
export async function getBrand(slug) {
    try {
        const response = await fetch(`${API_URL}/api/brands/${slug}`);
        return response.json();
    } catch (error) {
        console.warn('Backend unavailable');
        return null;
    }
}

// ============================================
// UPLOAD ENDPOINTS (Cloudinary when configured)
// ============================================

/**
 * Upload image
 */
export async function uploadImage(file) {
    try {
        const formData = new FormData();
        formData.append('image', file);

        const response = await fetch(`${API_URL}/api/upload/image`, {
            method: 'POST',
            body: formData
        });
        return response.json();
    } catch (error) {
        console.warn('Upload failed, using local data URL');
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve({ success: true, url: reader.result });
            reader.readAsDataURL(file);
        });
    }
}

/**
 * Upload packshot with background removal
 */
export async function uploadPackshot(file) {
    try {
        const formData = new FormData();
        formData.append('image', file);

        const response = await fetch(`${API_URL}/api/upload/packshot`, {
            method: 'POST',
            body: formData
        });
        return response.json();
    } catch (error) {
        console.warn('Packshot upload failed, using local data URL');
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve({ success: true, url: reader.result, backgroundRemoved: false });
            reader.readAsDataURL(file);
        });
    }
}

/**
 * Upload logo
 */
export async function uploadLogo(file) {
    try {
        const formData = new FormData();
        formData.append('image', file);

        const response = await fetch(`${API_URL}/api/upload/logo`, {
            method: 'POST',
            body: formData
        });
        return response.json();
    } catch (error) {
        console.warn('Logo upload failed, using local data URL');
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve({ success: true, url: reader.result });
            reader.readAsDataURL(file);
        });
    }
}

// ============================================
// HEALTH CHECK
// ============================================

/**
 * Check backend health
 */
export async function checkHealth() {
    try {
        const response = await fetch(`${API_URL}/health`);
        return response.json();
    } catch (error) {
        return { status: 'offline', error: error.message };
    }
}
