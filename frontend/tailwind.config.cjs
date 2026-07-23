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
        card: 'var(--radius-card)',
        'card-lg': '28px',
        btn: '14px',
        xl: '12px'
      },
      fontSize: {
        hero: ['clamp(2rem,4vw,3rem)', { lineHeight: '1.1', fontWeight: '700' }],
        h2: ['1.5rem', { lineHeight: '1.2', fontWeight: '700' }],
        'section-title': ['1.5rem', { lineHeight: '1.2', fontWeight: '700' }],
        subtitle: ['clamp(1.125rem,2vw,1.375rem)', { lineHeight: '1.5', fontWeight: '400' }],
        desc: ['0.875rem', { lineHeight: '1.4', fontWeight: '400' }]
      },
      maxWidth: {
        'screen-mobile': '480px',
        guide: '800px'
      },
      spacing: {
        'btn-h': '52px',
        card: '20px',
        'card-md': '28px',
        'card-lg': '32px'
      }
    }
  },
  plugins: []
};
