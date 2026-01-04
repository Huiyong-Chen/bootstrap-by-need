export default {
  // 针对源码文件：ESLint 修复 + Prettier 格式化
  "src/**/*.{ts,mts,tsx,js,mjs,cjs}": ["eslint --fix", "prettier --write"],

  // 针对配置文件和样式等：Prettier 格式化
  "*.{css,less,scss,html,json,md,yml,yaml}": ["prettier --write"],

  // package.json 排序
  "package.json": ["sort-package-json", "prettier --write"],
};
