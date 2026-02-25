import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        brand: {
          blue: {
            DEFAULT: '#222222',
            50: '#F5F5F5',
            100: '#EBEBEB',
            200: '#D6D6D6',
            300: '#B8B8B8',
            400: '#8E8E8E',
            500: '#6B6B6B',
            600: '#4B4B4B',
            700: '#333333',
            800: '#222222',
            900: '#111111',
          },
          orange: {
            DEFAULT: '#EF6253',
            50: '#FEF2F0',
            100: '#FDE3E0',
            200: '#FBC7C1',
            300: '#F7A39A',
            400: '#EF6253',
            500: '#E04D3E',
            600: '#C43B2F',
            700: '#A42E24',
            800: '#86241B',
            900: '#6B1C15',
          },
        },
        korea: {
          DEFAULT: '#222222',
          50: '#F5F5F5', 100: '#EBEBEB', 200: '#D6D6D6', 300: '#B8B8B8',
          400: '#8E8E8E', 500: '#6B6B6B', 600: '#4B4B4B', 700: '#333333',
          800: '#222222', 900: '#111111', light: '#6B6B6B',
        },
        china: {
          DEFAULT: '#EF6253',
          50: '#FEF2F0', 100: '#FDE3E0', 200: '#FBC7C1', 300: '#F7A39A',
          400: '#EF6253', 500: '#E04D3E', 600: '#C43B2F', 700: '#A42E24',
          800: '#86241B', 900: '#6B1C15', light: '#F7A39A',
        },
        escrow: {
          DEFAULT: '#41B979',
          50: '#ECFDF5', 100: '#D1FAE5', 200: '#A7F3D0', 300: '#6EE7B7',
          400: '#41B979', 500: '#34A06A', 600: '#2A8757', 700: '#236E47',
          800: '#1C5739', 900: '#16422C',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius))',
        sm: 'calc(var(--radius))',
      },
      fontFamily: {
        sans: ['var(--font-pretendard)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
