# Decision 003: 引入 TypeScript 但不引入打包工具

## 背景 (Context)

随着业务逻辑变得复杂，纯 JavaScript (ESM) 开发开始暴露出维护性问题：

1. **重构风险高**：修改数据结构无法自动检测波及范围。
2. **开发效率低**：编写代码时缺乏智能提示，频繁查阅定义或文档。
3. **运行时错误**：低级类型错误（如拼写错误、undefined 访问）频繁发生在运行时。

## 决策 (Decision)

在项目中正式引入 **TypeScript** 作为开发语言，但**暂不引入** Webpack/Vite 等打包工具。

### 具体配置

1. **编译器**：仅安装 `typescript` 依赖。
2. **编译模式**：`tsc --watch` 实时编译。
3. **输出策略**：
   - 源码目录：`src/` (TypeScript)
   - 产物目录：`dist/` (JavaScript)
   - 映射关系：1 TS 文件 = 1 JS 文件 (保留目录结构)。
4. **TSConfig 核心设置**：
   - `"target": "ESNext"` (保留现代语法)
   - `"module": "ESNext"` (保留 import/export，交给浏览器处理)
   - `"moduleResolution": "NodeNext"`

### 收益 (Positive)

1. **类型安全**：编译期即可发现大部分逻辑错误。
2. **重构信心**：IDE 能够准确重命名符号和查找引用。
3. **架构透明**：产物依然是可读的 ESM 模块，未经过 Bundler 的黑盒处理，便于调试。

### 代价/约束 (Negative)

1. **引入编译步**：无法再直接修改浏览器运行的代码，必须修改 `src` 并等待编译。
2. **导入后缀限制**：由于没有打包工具处理模块解析，在 `.ts` 文件中引用其他本地模块时，**必须显式添加 `.js` 后缀** (例如 `import { foo } from './bar.js'`)。这是原生 ESM 的标准要求，但在 TS 开发体验中略显怪异。
3. **源码映射**：需要配置 SourceMap 才能在浏览器中调试 TS 源码。

## 替代方案 (Alternatives Considered)

- **JSDoc**：虽然无编译成本，但语法冗余，无法提供像 Interface 这样清晰的结构定义。
- **Vite/Webpack**：能解决类型和打包问题，但掩盖了模块加载的真实开销，属于过早优化。
