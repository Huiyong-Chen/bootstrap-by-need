# CSS 样式文件结构

## 概述

样式文件已按照功能和组件进行模块化拆分，提高了可维护性和开发效率。

## 文件结构

```
src/styles/
├── index.css          # 全局基础样式（字体、颜色、布局基础）
├── base.css           # 基础布局样式（容器、头部、主要布局）
├── forms.css          # 表单组件样式（输入框、按钮、选择器）
├── components.css     # 可复用组件样式（卡片、消息、列表等）
├── pages.css          # 页面特定样式（首页、导入页面等）
├── responsive.css     # 响应式设计样式
└── README.md          # 本文档
```

## 样式组织原则

### 1. **单一职责**
每个CSS文件都有明确的职责范围，避免样式耦合。

### 2. **组件化**
样式按照UI组件进行组织，便于复用和维护。

### 3. **移动优先**
响应式设计采用移动优先策略，从小屏幕开始逐步适配大屏幕。

### 4. **语义化**
CSS类名使用语义化的命名，便于理解和维护。

## 加载顺序

HTML文件中样式的加载顺序非常重要：

```html
<!-- 1. 全局基础样式 -->
<link rel="stylesheet" href="./src/styles/index.css" />

<!-- 2. 基础布局 -->
<link rel="stylesheet" href="./src/styles/base.css" />

<!-- 3. 表单组件 -->
<link rel="stylesheet" href="./src/styles/forms.css" />

<!-- 4. 可复用组件 -->
<link rel="stylesheet" href="./src/styles/components.css" />

<!-- 5. 页面特定样式 -->
<link rel="stylesheet" href="./src/styles/pages.css" />

<!-- 6. 响应式覆盖 -->
<link rel="stylesheet" href="./src/styles/responsive.css" />
```

## 样式覆盖规则

- **基础样式 (index.css)**: 全局变量、基础元素样式
- **布局样式 (base.css)**: 页面布局、容器样式
- **组件样式 (forms.css/components.css)**: 具体组件样式
- **页面样式 (pages.css)**: 页面特定覆盖
- **响应式样式 (responsive.css)**: 媒体查询覆盖

## 最佳实践

### 1. **避免样式冲突**
- 使用特定的类名前缀
- 遵循BEM命名规范
- 合理使用CSS层级选择器

### 2. **性能优化**
- 减少不必要的样式重绘
- 使用CSS变量提高可维护性
- 合理使用CSS Grid和Flexbox

### 3. **维护性**
- 每个组件的样式集中管理
- 注释清晰，说明样式用途
- 定期清理未使用的样式

## 开发指南

### 添加新组件样式
1. 确定组件所属的样式文件
2. 在对应文件中添加样式
3. 确保样式遵循现有的命名规范
4. 测试响应式表现

### 修改现有样式
1. 找到对应的样式文件
2. 理解样式覆盖层级
3. 小心处理响应式覆盖
4. 测试所有相关页面

这个结构化的CSS组织方式，使得样式代码更加清晰、易于维护，并且支持团队协作开发。
