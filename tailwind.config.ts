import type { Config } from 'tailwindcss'
import { fontFamily } from 'tailwindcss/defaultTheme'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  safelist: [
    {
      pattern: /^(bg|text|group-hover:text|dark:text|dark:bg|dark:group-hover:text)-(blue|green|red|yellow|purple|pink|indigo|gray)-([1-9]00)(\/20)?$/,
    },
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)', ...fontFamily.sans],
      },
      colors: {
        gray: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
          950: '#030712',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      typography: {
        DEFAULT: {
          css: {
            'p': {
              marginTop: '1rem',
              marginBottom: '1rem',
            },
            'img': {
              marginTop: '1.5rem',
              marginBottom: '1.5rem',
            },
            'h1': {
              marginTop: '2rem',
              marginBottom: '1rem',
              fontSize: '2rem',
            },
            'h2': {
              marginTop: '1.75rem',
              marginBottom: '1rem',
              fontSize: '1.5rem',
            },
            'h3': {
              marginTop: '1.5rem',
              marginBottom: '0.75rem',
              fontSize: '1.25rem',
            },
            'h4, h5, h6': {
              marginTop: '1.25rem',
              marginBottom: '0.75rem',
            },
            'ul, ol': {
              marginTop: '0.75rem',
              marginBottom: '0.75rem',
              paddingLeft: '1.25rem',
            },
            'li': {
              marginTop: '0.375rem',
              marginBottom: '0.375rem',
            },
            'blockquote': {
              marginTop: '1.5rem',
              marginBottom: '1.5rem',
              paddingLeft: '1rem',
              borderLeftWidth: '4px',
              borderLeftColor: '#e5e7eb',
              fontStyle: 'italic',
            },
            'hr': {
              marginTop: '2rem',
              marginBottom: '2rem',
            },
            'pre': {
              marginTop: '1.5rem',
              marginBottom: '1.5rem',
            },
            'table': {
              marginTop: '1.5rem',
              marginBottom: '1.5rem',
            },
            'code': {
              backgroundColor: '#f3f4f6',
              padding: '0.2em 0.4em',
              borderRadius: '0.25rem',
              fontSize: '0.875em',
            },
            'a': {
              textDecoration: 'none',
              '&:hover': {
                textDecoration: 'underline',
              },
            },
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}

export default config