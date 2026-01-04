# 007 - 代码质量与标准化策略 (Quality & Standardization Strategy)

## 背景

Stage 6 升级导致了 `.mts` 语法冲突，且随着项目复杂度提升，代码风格不一致和 Git 提交混乱的问题日益显著。

## 决策 (Decisions)

### 1. 质量与格式化工具链

- **决策**：采用 **ESLint v9 (Flat Config)** + **Prettier**。
- **配置**：使用 `eslint.config.mts` (配合 jiti) 和 `prettier` 配合。
- **规则**：解决 `.mts` 下泛型 `<T>` 解析歧义，采用 `<T,>` 写法。

### 2. Git 钩子与自动化执法

- **决策**：引入 **Husky** 管理 Git Hooks。
- **策略**：
  - `pre-commit`: 触发 `lint-staged`，对暂存区代码执行 `eslint --fix` 和 `prettier --write`。
  - `commit-msg`: 触发 `commitlint`，校验提交信息格式。

### 3. 配置文件解耦

- **决策**：避免 `package.json` 膨胀，将工程配置抽离为独立文件。
- **产物**：`lint-staged.config.mts`, `commitlint.config.mts`。

### 4. 提交规范

- **决策**：强制执行 **Conventional Commits** 规范。
- **理由**：保证 Git 历史的可读性，为未来自动化生成 Changelog 铺路。

## 后果 (Consequences)

- ✅ **一致性**：无论谁写代码，格式最终都一样。
- ✅ **安全性**：低级错误和不规范代码无法入库。
- ✅ **可维护性**：配置文件独立且类型安全，易于扩展。
- ⚠️ **门槛**：提交代码变严格了，需要开发者适应规范化的工作流。
