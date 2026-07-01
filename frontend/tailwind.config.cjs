/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx,jsx,js}'],
  theme: {
    extend: {
      colors: {
        accent: '#2563EB',
        'accent-soft': '#EFF6FF',
        risk: '#DC2626',
        graphite: '#1F2937',
        'graphite-muted': '#6B7280',
        surface: '#F9FAFB',
        warning: '#F59E0B',
        'warning-soft': '#FFFBEB'
      },
      boxShadow: {
        soft: '0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)',
        card: '0 2px 8px rgba(0,0,0,0.06)'
      },
      fontFamily: {
        sans: [
          'Inter',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'sans-serif'
        ]
      },
      borderRadius: {
        xl: '12px'
      },
      maxWidth: {
        'screen-mobile': '480px',
        guide: '800px'
      }
    }
  },
  plugins: []
};

