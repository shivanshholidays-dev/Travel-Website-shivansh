const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const BASE_URL = NEXT_PUBLIC_API_URL.replace('/api', '');

/**
 * Resolves an image path to a full URL.
 * Handles:
 * 1. Absolute URLs (starting with http) - Returned as is.
 * 2. Relative paths (local uploads) - Prepends backend base URL.
 * 3. Fallback - Returns a default placeholder if no path is provided.
 * 
 * @param path - The image path or absolute URL.
 * @param fallback - Optional custom fallback image path.
 * @returns {string} The resolved image URL.
 */
export const getImgUrl = (path?: string, fallback: string = '/assets/img/tour/home-9/thumb-5.jpg'): string => {
    if (!path) return fallback;
    if (path.startsWith('http')) return path;

    // Ensure we don't have double slashes
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;
    return `${BASE_URL}/${cleanPath}`;
};
