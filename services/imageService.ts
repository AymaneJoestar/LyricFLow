
/**
 * Service to generate AI images using Pollinations.ai (No API Key required)
 */

export const generateCoverArtPrompt = (
    title: string,
    mood: string,
    style: string,
    description?: string
): string => {
    // Construct a detailed prompt
    // Formula: "{Title} album cover, {Mood} mood, {Style} style, {Description}, high quality, 4k, detailed"
    const pieces = [
        `${title} album cover art`,
        `${mood} mood`,
        `${style} style`,
        description ? description : '',
        'high quality',
        '4k',
        'highly detailed',
        'no text', // Attempt to reduce random text generation
        'centered'
    ];

    return pieces.filter(Boolean).join(', ');
};

export const generateCoverArtUrl = (
    title: string,
    mood: string,
    style: string,
    description?: string
): string => {
    const prompt = generateCoverArtPrompt(title, mood, style, description);
    const encodedPrompt = encodeURIComponent(prompt);

    // Pollinations URL format
    // We add a random seed to ensure uniqueness if they regenerate with same prompt
    const seed = Math.floor(Math.random() * 100000);
    return `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&model=flux&nologo=true&seed=${seed}`;
};
