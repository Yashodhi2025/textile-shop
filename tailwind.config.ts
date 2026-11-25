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
          primary: 'var(--brand-primary, #49382C)',
          secondary: 'var(--brand-secondary, #EAE2D7)',
          accent: 'var(--brand-accent, #B18D69)',
        },
        loome: {
          espresso: 'var(--heading-color, #2D2722)',
          mocha: 'var(--brand-primary, #49382C)',
          mushroom: 'var(--muted-color, #66584D)',
          champagne: 'var(--brand-accent, #B18D69)',
          cream: '#F7F4EF',
          'cream-soft': '#FFFFFF',
          ivory: '#F7F4EF',
          'ivory-soft': '#FFFFFF',
          'ivory-deep': '#EAE2D7',
          charcoal: '#2D2722',
          'charcoal-soft': '#49382C',
          muted: '#66584D',
          olive: '#66584D',
          'olive-dark': '#49382C',
          gold: '#B18D69',
          'gold-light': '#C7A684',
          beige: '#EAE2D7',
          'beige-soft': '#F2ECE3',
        },
      },
      fontFamily: {
        heading: ['var(--heading-font, "Manrope")', '"Manrope"', 'system-ui', 'sans-serif'],
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        editorial: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['var(--body-font, "Manrope")', '"Manrope"', '"Inter"', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        btn: '11px',
        card: '16px',
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
