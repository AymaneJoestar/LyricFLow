/**
 * Service to generate AI images using Stable Diffusion via Replicate API
 * Now calls the backend endpoint to avoid CORS issues
 */

const API_URL = import.meta.env.VITE_API_URL || '/api';

export const generateCoverArtPrompt = (
    title: string,
    mood: string,
    style: string,
    description?: string
): string => {
    // Construct a detailed prompt for Stable Diffusion
    const pieces = [
        `${title} album cover art`,
        `${mood} atmosphere`,
        `${style} style`,
        description ? description : '',
        'professional album cover design',
        'high quality',
        'detailed',
        'no text',
        'centered composition',
        'vibrant colors'
    ];

    return pieces.filter(Boolean).join(', ');
};

/**
 * Generate cover art using Replicate's Stable Diffusion via backend
 * This returns a promise that resolves to the image URL
 */
export const generateCoverArt = async (
    title: string,
    mood: string,
    style: string,
    description?: string
): Promise<string> => {
    const prompt = generateCoverArtPrompt(title, mood, style, description);

    // Get token from localStorage
    const user = JSON.parse(localStorage.getItem('lyricflow_current_user') || 'null');
    const token = user ? user.token : null;

    try {
        const response = await fetch(`${API_URL}/generate-cover-art`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            },
            body: JSON.stringify({ prompt })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Image generation failed: ${response.status}`);
        }

        const data = await response.json();
        return data.imageUrl;
    } catch (error: any) {
        console.error('Failed to generate cover art:', error);
        throw new Error(error.message || 'Failed to generate cover art');
    }
};

/**
 * Legacy function for backward compatibility
 * Now this is async, so components using it need to await
 */
export const generateCoverArtUrl = async (
    title: string,
    mood: string,
    style: string,
    description?: string
): Promise<string> => {
    return generateCoverArt(title, mood, style, description);
};
