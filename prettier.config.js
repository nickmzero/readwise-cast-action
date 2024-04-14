module.exports = {
  overrides: [
    {
      files: [
        "{__tests__,components,contexts,hooks,pages,app,styles,test-utils,types,utils}/**/*.{js,jsx,ts,tsx}",
        "middleware.ts",
        "styles.ts",
      ],
      options: {
        singleQuote: true,
        bracketSpacing: false,
        bracketSameLine: true,
        tabWidth: 2,
      },
    },
  ],
  plugins: [],
};
