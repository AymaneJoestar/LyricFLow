/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                display: ['Space Grotesk', 'sans-serif'],
            },
            colors: {
                primary: '#1DB954', // Spotify Green (Accent)
                secondary: '#00ADB5', // Teal (Secondary Accent)
                highlight: '#FF6F61', // Coral (Call to Action)
                dark: '#121212', // Charcoal Black
                surface: '#1E1E1E', // Slightly lighter dark for cards
            },
            animation: {
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            }
        }
    },
    plugins: [],
}
