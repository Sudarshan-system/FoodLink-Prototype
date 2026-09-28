/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Harbor & Teal Design System
        harbor: {
          950: '#08101A',
          900: '#0D1B2A', // Dark Navy-Charcoal Base
          850: '#112235',
          800: '#16273B', // Surface Navy Card
          700: '#1F354D', // Border & Elevated Navy
          600: '#2C496A',
          500: '#475569', // Muted Cool Slate
          400: '#64748B',
          300: '#94A3B8',
          200: '#E2E8F0', // Border Light
          100: '#EDF2F4',
          50: '#F4F7F8',  // Light Mode Base Cool Off-White
        },
        teal: {
          50: '#F0FDFA',
          100: '#CCFBF1',
          200: '#99F6E4',
          300: '#5EEAD4',
          400: '#2DD4BF',
          500: '#14919B', // Primary Teal Accent
          600: '#0E747E',
          700: '#0D5D65',
          800: '#114B52',
          900: '#113E44',
        },
        trust: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#2563EB', // Trust Blue CTA Accent
          600: '#1D4ED8',
          700: '#1E40AF',
          800: '#1E3A8A',
        },
        // Dedicated Verified State (retained green distinct from teal)
        verified: {
          50: '#F0FDF4',
          100: '#DCFCE7',
          500: '#16A34A',
          600: '#15803D',
          700: '#166534',
        },
        // Backward-compatible aliases for harbor and teal
        ink: {
          950: '#08101A',
          900: '#0D1B2A',
          850: '#112235',
          800: '#16273B',
          700: '#1F354D',
          600: '#2C496A',
          500: '#475569',
          400: '#64748B',
          300: '#94A3B8',
          200: '#E2E8F0',
          100: '#EDF2F4',
          50: '#F4F7F8',
        },
        saffron: {
          50: '#F0FDFA',
          100: '#CCFBF1',
          200: '#99F6E4',
          300: '#5EEAD4',
          400: '#2DD4BF',
          500: '#14919B',
          600: '#0E747E',
          700: '#0D5D65',
          800: '#114B52',
          900: '#113E44',
        }
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'sans-serif'
        ],
      },
      boxShadow: {
        'harbor-sm': '0 1px 2px 0 rgba(13, 27, 42, 0.05)',
        'harbor-md': '0 4px 6px -1px rgba(13, 27, 42, 0.08), 0 2px 4px -1px rgba(13, 27, 42, 0.04)',
        'harbor-lg': '0 10px 15px -3px rgba(13, 27, 42, 0.1), 0 4px 6px -2px rgba(13, 27, 42, 0.05)',
        'teal-glow': '0 0 20px -3px rgba(20, 145, 155, 0.35)',
        'blue-glow': '0 0 20px -3px rgba(37, 99, 235, 0.35)',
      },
      minHeight: {
        'touch': '48px',
      },
      minWidth: {
        'touch': '48px',
      }
    },
  },
  plugins: [],
}
