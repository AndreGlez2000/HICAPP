/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: '#522c45',
        cta: '#e87a3f',
        success: '#19b78e',
        bg: '#f8f4f6',
        surface: '#ffffff',
        muted: '#70787c',
        border: '#e2e8f0',
        ink: '#0f172a',
        // Category tints
        'cat-alimentacion-tint': '#fef9c3',
        'cat-alimentacion-fg': '#854d0e',
        'cat-actividad-tint': '#dcfce7',
        'cat-actividad-fg': '#166534',
        'cat-sueno-tint': '#ede9fe',
        'cat-sueno-fg': '#6b21a8',
      },
      fontFamily: {
        fredoka: ['Fredoka_700Bold'],
        nunito: ['Nunito_400Regular', 'Nunito_700Bold'],
        'nunito-bold': ['Nunito_700Bold'],
      },
      borderRadius: {
        card: '16px',
        input: '12px',
        pill: '999px',
        fab: '32px',
      },
    },
  },
  plugins: [],
};
