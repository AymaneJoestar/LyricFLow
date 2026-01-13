/**
 * Cloudinary Image Upload Service
 * Handles uploading images directly to Cloudinary from the browser
 */

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

export interface UploadProgress {
    loaded: number;
    total: number;
    percentage: number;
}

export const uploadService = {
    /**
     * Upload an image file to Cloudinary
     * @param file - The image file to upload
     * @param onProgress - Optional callback for upload progress
     * @returns Promise<string> - The public URL of the uploaded image
     */
    uploadToCloudinary: async (
        file: File,
        onProgress?: (progress: UploadProgress) => void
    ): Promise<string> => {
        // Check if credentials are loaded
        if (!CLOUD_NAME || !UPLOAD_PRESET) {
            console.error('Cloudinary config missing:', { CLOUD_NAME, UPLOAD_PRESET });
            throw new Error('Cloudinary not configured. Check .env.local file.');
        }

        // Validate file
        const maxSize = 5 * 1024 * 1024; // 5 MB
        if (file.size > maxSize) {
            throw new Error('File size must be less than 5 MB');
        }

        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            throw new Error('File must be JPG, PNG, GIF, or WebP');
        }

        // Prepare form data
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', UPLOAD_PRESET);
        formData.append('folder', 'lyricflow/avatars');

        console.log('Uploading to Cloudinary:', {
            cloudName: CLOUD_NAME,
            preset: UPLOAD_PRESET,
            fileType: file.type,
            fileSize: file.size
        });

        try {
            // Upload to Cloudinary
            const response = await fetch(
                `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
                {
                    method: 'POST',
                    body: formData,
                }
            );

            const data = await response.json();

            if (!response.ok) {
                console.error('Cloudinary error response:', data);
                throw new Error(data.error?.message || 'Upload failed');
            }

            console.log('Upload successful:', data.secure_url);
            return data.secure_url; // HTTPS URL of uploaded image
        } catch (error) {
            console.error('Cloudinary upload error:', error);
            throw new Error('Failed to upload image. Please try again.');
        }
    },

    /**
     * Generate a color from a string (for avatar fallback)
     */
    getColorFromString: (str: string): string => {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        const hue = hash % 360;
        return `hsl(${hue}, 65%, 50%)`;
    },

    /**
     * Get initials from username
     */
    getInitials: (username: string): string => {
        const parts = username.trim().split(' ');
        if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return username.slice(0, 2).toUpperCase();
    }
};
