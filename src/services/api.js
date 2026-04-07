// utils/api.js
import { getToken } from '@/utils/auth';

// Remove '/api' from base URL since your backend routes already include it
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://film-server-qlxt.onrender.com';

// Generic fetch with authentication
const authFetch = async (endpoint, options = {}) => {
    const token = getToken();
    
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };
    
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers,
        });
        
        // Handle non-2xx responses
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `API Error: ${response.status}`);
        }
        
        return response;
    } catch (error) {
        console.error(`API Error (${endpoint}):`, error);
        throw error;
    }
};

// Helper to handle JSON responses
const handleResponse = async (response) => {
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || 'Request failed');
    }
    return data;
};

export const api = {
    // Auth endpoints
    auth: {
        login: async (credentials) => {
            const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credentials),
            });
            return handleResponse(response);
        },
        
        register: async (userData) => {
            const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData),
            });
            return handleResponse(response);
        },
        
        logout: async () => {
            const response = await authFetch('/api/auth/logout', {
                method: 'POST',
            });
            return handleResponse(response);
        },
        
        forgotPassword: async (email) => {
            const response = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            return handleResponse(response);
        },
        
        resetPassword: async (token, password) => {
            const response = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, password }),
            });
            return handleResponse(response);
        },
    },
    
    // User endpoints
    user: {
        getProfile: async () => {
            const response = await authFetch('/api/user/profile');
            return handleResponse(response);
        },
        
        updateProfile: async (data) => {
            const response = await authFetch('/api/user/profile', {
                method: 'PUT',
                body: JSON.stringify(data),
            });
            return handleResponse(response);
        },
        
        getDashboard: async () => {
            const response = await authFetch('/api/user/dashboard');
            return handleResponse(response);
        },
    },
    
    // Projects endpoints
    projects: {
        // Get all projects (with filters)
        getAll: async (filters = {}) => {
            const queryParams = new URLSearchParams(filters).toString();
            const endpoint = `/api/projects${queryParams ? `?${queryParams}` : ''}`;
            const response = await authFetch(endpoint);
            return handleResponse(response);
        },
        
        // Get user's own projects
        getMyProjects: async () => {
            const response = await authFetch('/api/projects/my-projects');
            return handleResponse(response);
        },
        
        // Get single project by ID
        getById: async (id) => {
            const response = await authFetch(`/api/projects/${id}`);
            return handleResponse(response);
        },
        
        // Get project by slug
        getBySlug: async (slug) => {
            const response = await authFetch(`/api/projects/slug/${slug}`);
            return handleResponse(response);
        },
        
        // Create new project
        create: async (projectData) => {
            const response = await authFetch('/api/projects', {
                method: 'POST',
                body: JSON.stringify(projectData),
            });
            return handleResponse(response);
        },
        
        // Submit project (with payment)
        submit: async (projectData) => {
            const response = await authFetch('/api/projects/submit', {
                method: 'POST',
                body: JSON.stringify(projectData),
            });
            return handleResponse(response);
        },
        
        // Update project
        update: async (id, projectData) => {
            const response = await authFetch(`/api/projects/${id}`, {
                method: 'PUT',
                body: JSON.stringify(projectData),
            });
            return handleResponse(response);
        },
        
        // Delete project
        delete: async (id) => {
            const response = await authFetch(`/api/projects/${id}`, {
                method: 'DELETE',
            });
            return handleResponse(response);
        },
        
        // Add review to project
        addReview: async (id, reviewData) => {
            const response = await authFetch(`/api/projects/${id}/reviews`, {
                method: 'POST',
                body: JSON.stringify(reviewData),
            });
            return handleResponse(response);
        },
    },
    
    // Admin endpoints
    admin: {
        getAllUsers: async () => {
            const response = await authFetch('/api/admin/users');
            return handleResponse(response);
        },
        
        getAllProjects: async () => {
            const response = await authFetch('/api/admin/projects');
            return handleResponse(response);
        },
        
        updateUserRole: async (userId, role) => {
            const response = await authFetch(`/api/admin/users/${userId}/role`, {
                method: 'PUT',
                body: JSON.stringify({ role }),
            });
            return handleResponse(response);
        },
        
        getStats: async () => {
            const response = await authFetch('/api/admin/stats');
            return handleResponse(response);
        },
    },
};

// Helper function to get auth headers for external use
export const getAuthHeaders = () => {
    const token = getToken();
    return {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
    };
};

export default api;