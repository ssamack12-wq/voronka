/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx,jsx,js}'],
  theme: {
    extend: {
      colors: {
        accent: '#2563EB',
        'accent-soft': '#EFF6FF',
        risk: '#DC2626',
        graphite: '#111827',
        'graphite-muted': '#64748B',
        surface: '#F8FAFC',
        warning: '#F59E0B',
        'warning-soft': '#FFFBEB'
      },
      boxShadow: {
        soft: '0 10px 30px rgba(0,0,0,0.04)',
        card: '0 10px 30px rgba(0,0,0,0.04)',
        'card-hover': '0 16px 40px rgba(0,0,0,0.06)',
        btn: '0 4px 14px rgba(37,99,235,0.12)'
      },
      fontFamily: {
        sans: [
          'SF Pro Display',
          'SF Pro Text',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'sans-serif'
        ]
      },
      borderRadius: {
        card: '20px',
        btn: '14px',
        xl: '12px'
      },
      fontSize: {
        hero: ['clamp(2.25rem,4.5vw,3.5rem)', { lineHeight: '1.05', fontWeight: '700' }],
        'section-title': ['clamp(1.75rem,3vw,2.25rem)', { lineHeight: '1.15', fontWeight: '600' }],
        subtitle: ['clamp(1.125rem,2vw,1.375rem)', { lineHeight: '1.5', fontWeight: '400' }],
        desc: ['0.9375rem', { lineHeight: '1.6', fontWeight: '400' }]
      },
      maxWidth: {
        'screen-mobile': '480px',
        guide: '800px'
      },
      spacing: {
        'btn-h': '52px'
      }
    }
  },
  plugins: []
};
