const config = {
  plugins: ["@tailwindcss/postcss"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: 'var(--color-background)',
        foreground: 'var(--color-foreground)',
        'muted-foreground': 'var(--color-muted-foreground)',
      },
    },
  },
};

export default config;
