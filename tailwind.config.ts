import type { Config } from 'tailwindcss';
import animate from 'tailwindcss-animate';

const config: Config = {
  darkMode: ['class'],
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px'
      }
    },
    extend: {
      colors: {
        brand: {
          DEFAULT: '#2F3C7E',
          soft: '#E2E8F0',
          amber: '#F6AD55',
          danger: '#F56565'
        }
      }
    }
  },
  plugins: [animate]
};

export default config;
