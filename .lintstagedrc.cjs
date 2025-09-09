// const path = require('path'); // Unused for now

module.exports = {
  // Ignore files that shouldn't be linted/formatted
  ignores: [
    '**/package-lock.json',
    '**/yarn.lock',
    '**/pnpm-lock.yaml',
    '**/node_modules/**',
    '**/dist/**',
    '**/build/**',
    '**/.nuxt/**',
    '**/.output/**',
    '**/coverage/**',
  ],

  // Frontend files (JS, TS, Vue)

  'frontend/**/*.{js,ts,vue}': (files) => {
    const fileList = files.join(' ');

    return [
      `prettier --write --ignore-unknown ${fileList}`,
      `eslint --config eslint.config.mjs --fix ${fileList}`,
    ];
  },

  // Backend files (TypeScript)

  'backend/**/*.{ts,cts,mts}': (files) => {
    const fileList = files.join(' ');

    return [
      `prettier --write --ignore-unknown ${fileList}`,
      `eslint --config eslint.config.mjs --fix ${fileList}`,
    ];
  },

  // Script files

  'scripts/**/*.{js,mjs,cjs}': (files) => {
    const fileList = files.join(' ');

    return [
      `prettier --write --ignore-unknown ${fileList}`,
      `eslint --config eslint.config.mjs --fix ${fileList}`,
    ];
  },

  // Configuration files

  '*.{js,mjs,cjs,ts,json}': (files) => {
    const fileList = files.join(' ');

    return [`prettier --write --ignore-unknown ${fileList}`];
  },

  // Documentation and data files

  '**/*.{json,md,css,scss,yml,yaml}': (files) => {
    const fileList = files.join(' ');

    return [`prettier --write --ignore-unknown ${fileList}`];
  },
};
