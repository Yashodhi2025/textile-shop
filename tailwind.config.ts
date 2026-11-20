import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './node_modules/@deneb-ui/ui/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: 'var(--brand-primary, #747B65)',
          secondary: 'var(--brand-secondary, #262923)',
          accent: 'var(--brand-accent, #B59B79)',
        },
        loome: {
          ivory: '#F8F6F1',
          'ivory-soft': '#FCFBF8',
          'ivory-deep': '#F0ECE3',
          charcoal: '#262923',
          'charcoal-soft': '#3B3E36',
          muted: '#65685E',
          olive: '#747B65',
          'olive-dark': '#5D6350',
          gold: '#B59B79',
          'gold-light': '#CEB99C',
          beige: '#E8E0D5',
          'beige-soft': '#F2ECE3',
        },
      },
      fontFamily: {
        serif: ['var(--heading-font, "Cormorant Garamond")', '"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['var(--body-font, "Manrope")', '"Manrope"', '"Inter"', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        editorial: '0.22em',
        brand: '0.28em',
      },
      transitionTimingFunction: {
        luxury: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        marquee: 'marquee 38s linear infinite',
      },
    },
  },
  plugins: [],
};

export default config;
