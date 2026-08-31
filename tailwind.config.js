/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Fraunces', 'Georgia', 'serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace']
      },
      colors: {
        canvas: {
          DEFAULT: '#131110',
          raised: '#1B1815',
          recessed: '#0B0A08'
        },
        ink: {
          DEFAULT: '#F4EFE7',
          soft: '#B7AC9E',
          faint: '#7C7267'
        },
        paper: {
          DEFAULT: '#FBF7F0',
          ink: '#17140F'
        },
        ember: {
          DEFAULT: '#E2703A',
          deep: '#B4501F',
          soft: '#3A2A20'
        },
        jade: {
          DEFAULT: '#4FAE8E',
          deep: '#2F7C63',
          soft: '#1D2C27'
        },
        alert: {
          DEFAULT: '#D9553F',
          soft: '#3A211C'
        }
      }
    }
  },
  plugins: []
};
