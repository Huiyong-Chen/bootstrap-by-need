# 项目结构说明

## 目录结构

```
src/
├── datas/              # 数据层 - 业务数据和数据处理逻辑
│   ├── questions.ts    # 题目相关的数据处理
│   └── roles.ts        # 角色相关的数据处理
├── doms/               # DOM 操作层 - 页面元素管理和显示逻辑
│   ├── home.ts         # 首页DOM操作
│   ├── import-questions.ts  # 导入题目页面DOM操作
│   └── utils.ts        # DOM工具函数
├── events/             # 事件系统 - 跨组件通信
│   └── index.ts        # 事件管理器
├── handlers/           # 表单处理器 - 表单提交和验证逻辑
│   ├── roleFormHandler.ts      # 角色表单处理
│   └── questionImportHandler.ts # 题目导入表单处理
├── home/               # 页面入口 - 首页逻辑
│   └── index.ts        # 首页主逻辑
├── import-questions/   # 页面入口 - 导入题目页面逻辑
│   └── index.ts        # 导入题目页面主逻辑
├── indexed-db/         # 数据持久化 - IndexedDB 操作
│   └── index.ts        # 数据库操作
├── scripts/            # 遗留脚本 - 待重构的旧代码
│   ├── questions.ts
│   └── render.ts
├── states/             # 状态管理 - 应用状态管理
│   └── homeState.ts    # 首页状态管理
├── styles/             # 样式文件
│   ├── app.css
│   └── index.css
├── types/              # 类型定义
│   └── index.types.ts  # 全局类型定义
└── utils/              # 工具函数
    ├── docExporter.ts  # 文档导出工具
    ├── docx.js         # Word文档生成库
    └── notification.ts # UI通知管理器
```

## 职责分工

### 单一职责原则

每个文件/模块都有明确的单一职责：

1. **数据层 (datas/)**: 只负责数据处理，不涉及UI
2. **DOM层 (doms/)**: 只负责DOM操作，不涉及业务逻辑
3. **处理器 (handlers/)**: 只负责表单处理，不涉及状态管理
4. **状态管理 (states/)**: 只负责状态维护，不涉及UI更新
5. **工具函数 (utils/)**: 提供通用功能，不涉及具体业务

### 依赖关系

- **页面入口** → **状态管理** → **数据层**
- **页面入口** → **处理器** → **数据层**
- **页面入口** → **DOM层**
- **状态管理** → **工具函数**

这种结构确保了代码的可维护性、可测试性和职责分离。
