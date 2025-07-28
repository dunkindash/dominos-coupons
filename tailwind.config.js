/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Domino's brand colors (palette)
        'dominos-blue': {
          50: '#f0f8ff',
          100: '#e1f2fe',
          200: '#b3e0fc',
          300: '#85cefa',
          400: '#57bcf8',
          500: '#016593',
          600: '#136990',
          700: '#0e4c6b',
          800: '#093346',
          900: '#041a23',
        },
        'dominos-red': {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#e61838',
          600: '#cc213c',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        },
        // CSS custom property colors for design system
        'dominos-red-brand': 'hsl(var(--dominos-red))',
        'dominos-blue-brand': 'hsl(var(--dominos-blue))',
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        'dominos': ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      spacing: {
        'dominos-xs': '0.5rem',
        'dominos-sm': '1rem',
        'dominos-md': '1.5rem',
        'dominos-lg': '2rem',
        'dominos-xl': '3rem',
      },
    },
  },
  plugins: [],
}