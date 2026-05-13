/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx,jsx,js}'],
  theme: {
    extend: {
      colors: {
        accent: '#2563EB',
        risk: '#DC2626'
      },
      borderRadius: {
        xl: '12px'
      },
      maxWidth: {
        'screen-mobile': '480px'
      }
    }
  },
  plugins: []
};

