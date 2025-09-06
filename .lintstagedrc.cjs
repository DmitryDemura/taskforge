const fs = require('fs');
const path = require('path');

const rel = (base, files) => files.map((f) => path.relative(base, f));
const nuxtEslintReady = fs.existsSync(path.join(__dirname, 'frontend', '.nuxt', 'eslint.config.mjs'));

module.exports = {
  ignores: ['**/package-lock.json'],

  'frontend/**/*.{js,ts,vue}': (files) => {
    if (!nuxtEslintReady) return [];
    const fe = rel('frontend', files);
    return [`npm --prefix frontend run lint:fix -- ${fe.join(' ')}`];
  },

  'backend/**/*.ts': (files) => {
    const be = rel('backend', files);
    return [`npm --prefix backend run lint:fix -- ${be.join(' ')}`];
  },

  '**/*.{json,md,css,scss,yml,yaml}': (files) =>
    `prettier --write --ignore-unknown ${files.join(' ')}`
};
