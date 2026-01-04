# 006 - 现代构建架构与工程流 (Modern Build Architecture)

## 背景
随着 Stage 5 完成，项目面临三个核心问题：
1. **性能**：HTTP 请求过多导致加载延迟。
2. **依赖**：第三方库（如 docx）手动管理困难且污染源码。
3. **规范**：原生 ESM 对文件后缀的限制导致开发体验不佳。

## 决策 (Decisions)

### 1. 引入 Vite 构建系统
- **决策**：使用 Vite 作为开发服务器和生产打包工具。
- **理由**：Dev 模式保留 ESM 的秒开体验；Prod 模式提供打包优化（Tree-shaking, Minification）。
- **配置**：采用 MPA（多页应用）模式，明确 `index.html` 和 `import-questions.html` 两个入口。

### 2. 依赖管理迁移至 NPM
- **决策**：移除 `src/utils/` 下手动下载的库，全面接管至 `package.json`。
- **结果**：源码体积大幅减小，依赖版本由语义化版本控制（SemVer）管理。

### 3. 严格 ESM (.mts) 与自动化迁移
- **决策**：将所有 TypeScript 源码后缀规范化为 `.mts`。
- **工具**：引入 `tsx` 和 `minimatch`，编写 `scripts/ts-to-mts.mts` 脚本进行自动化迁移。
- **配置**：在 `vite.config.ts` 和 `tsconfig.json` 中显式配置对 `.mts` 的解析支持。

### 4. 路径策略 (Path Strategy)
- **别名 (@)**：用于 TS 模块（如组件、工具函数）。`@ -> src`。
- **相对路径 (./)**：用于静态资源（如 CSS）。确保 IDE 能正确跳转且保持组件内聚性。
- **类型声明**：引入 `vite/client` 类型定义，解决 TS 无法识别 CSS 导入的问题。

## 后果 (Consequences)
- ✅ **性能**：生产环境请求数从 ~50 降至 ~4（HTML+JS+CSS+Vendor）。
- ✅ **维护**：不需要再手动写 `.js` 后缀，依赖管理标准化。
- ✅ **基建**：拥有了自定义工程脚本的能力。
- ⚠️ **复杂性**：引入了 Node.js 环境依赖和构建配置，不再是“零配置”项目。