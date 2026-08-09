/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    // Replaces the default scale rather than extending it, so the larger radii
    // cannot be reintroduced: interactive elements use `rounded` (4px),
    // everything else stays square.
    borderRadius: {
      none: '0',
      DEFAULT: '4px',
      full: '9999px',
    },
    extend: {
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        }
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.8s ease-out forwards',
        'fade-in': 'fade-in 0.5s ease-out forwards',
      },
      fontFamily: {
        editorial: ['"Playfair Display"', 'serif'],
        creativo: ['Outfit', 'sans-serif'],
        minimal: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
