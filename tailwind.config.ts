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
          primary: 'var(--brand-primary, #8D7667)',
          secondary: 'var(--brand-secondary, #3B302B)',
          accent: 'var(--brand-accent, #C8A98B)',
        },
        loome: {
          espresso: 'var(--page-background, #201C1A)',
          mocha: 'var(--brand-secondary, #3B302B)',
          mushroom: 'var(--brand-primary, #8D7667)',
          champagne: 'var(--brand-accent, #C8A98B)',
          cream: '#F2E9DE',
          'cream-soft': '#FAF5EE',
          ivory: '#F2E9DE',
          'ivory-soft': '#FAF5EE',
          'ivory-deep': '#E6D9C9',
          charcoal: '#201C1A',
          'charcoal-soft': '#3B302B',
          muted: '#8D7667',
          olive: '#8D7667',
          'olive-dark': '#6B574A',
          gold: '#C8A98B',
          'gold-light': '#DCC3A9',
          beige: '#E6D9C9',
          'beige-soft': '#EFE5D8',
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
