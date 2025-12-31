# Decision 005: 架构重构与功能扩展

## 背景 (Context)

随着代码规模的增长和功能的增加，原有的简单脚本文件结构开始暴露出严重的维护性问题：

1. **文件职责混乱**：单个文件承担过多功能，超过380行代码难以维护
2. **代码组织无序**：相关功能分散在不同文件中，难以理解业务逻辑
3. **功能单一**：只能随机生成题目，无法导入和管理题库
4. **数据存储原始**：题目数据只能硬编码，无法持久化保存
5. **导出功能缺失**：生成的题目无法导出为标准文档格式

## 决策 (Decision)

进行一次全面的架构重构，引入现代化的代码组织结构和核心功能扩展。

### 重构策略

1. **页面化架构**：
   - 将单页应用拆分为 `home`（首页）和 `import-questions`（导入页）两个页面
   - 每个页面独立管理自己的状态和逻辑

2. **组件化开发**：
   - 提取可复用UI组件（`modal`、`roleSelector`）
   - 组件包含独立的样式、逻辑和模板
   - **组件实现策略**：采用JS生成DOM方式，保持与现有代码风格一致

3. **分层架构**：
   - **表现层**：`pages/` - 页面级逻辑
   - **组件层**：`components/` - 可复用UI组件
   - **业务层**：`api/` - 业务逻辑接口
   - **数据层**：`indexed-db/` - 本地数据存储
   - **工具层**：`utils/` - 通用工具函数

4. **状态管理优化**：
   - 引入事件驱动架构（`events/`）
   - 统一的状态变更通知机制

### 新功能特性

1. **题库导入功能**：
   - 支持批量导入题目数据
   - 岗位管理和题目分类

2. **文档导出功能**：
   - 生成Word格式的试卷和答案
   - 支持题目预览和导出

3. **本地数据存储**：
   - 使用IndexedDB进行数据持久化
   - 支持题库的增删改查

## 收益 (Positive)

1. **维护性提升**：代码按职责分离，每个文件功能单一
2. **开发效率**：组件复用减少重复代码，页面拆分提高开发并行度
3. **功能完整性**：从原型工具转变为完整的产品
4. **用户体验**：支持题库管理和文档导出，实用性大幅提升
5. **架构可扩展性**：分层架构为未来功能扩展奠定基础

## 代价/约束 (Negative)

1. **重构复杂度**：一次性重构涉及大量文件的移动和重构
2. **学习成本**：新的架构模式需要团队适应
3. **依赖增加**：引入docx库增加包体积
4. **向后兼容**：重构后无法直接使用旧的代码结构

## 替代方案 (Alternatives Considered)

### 组件实现方式选择

#### HTML-First (Template方式)

**实现方式**：
```html
<!-- 模板必须一开始就存在于DOM中 -->
<template id="modal-template">
  <div class="modal-overlay">
    <div class="modal-content">
      <div class="modal-header">
        <slot name="title"></slot>
        <button class="close-btn">&times;</button>
      </div>
      <div class="modal-body">
        <slot name="content"></slot>
      </div>
      <div class="modal-footer">
        <slot name="actions"></slot>
      </div>
    </div>
  </div>
</template>

<!-- 使用时需要克隆模板 -->
<script>
function createModal(title, content, actions) {
  const template = document.getElementById('modal-template');
  const clone = template.content.cloneNode(true);

  clone.querySelector('[slot="title"]').textContent = title;
  clone.querySelector('[slot="content"]').innerHTML = content;
  clone.querySelector('[slot="actions"]').innerHTML = actions;

  // 事件需要重新绑定
  clone.querySelector('.close-btn').onclick = () => closeModal();

  return clone;
}
</script>
```

**优势**：
- ✅ DOM结构清晰，HTML中一目了然
- ✅ 理论上分离关注点，HTML和JS逻辑分开

**劣势**：
- ❌ **模板放置位置问题**：template必须一开始就存在DOM中，但往往与其克隆出的内容应该放置的位置不一致
- ❌ **状态管理复杂**：每次DOM操作都需要小心避免误删template，导致额外的防御性编程
- ❌ **事件绑定复杂**：模板克隆后事件需要重新绑定，容易遗漏
- ❌ **数据同步困难**：状态变化需要手动更新已克隆的DOM实例
- ❌ **调试不便**：需要在模板和克隆元素之间切换，增加调试复杂度
- ❌ **TypeScript类型检查困难**：模板内容缺乏类型安全保障

**实际体验与关键问题**：
尝试后发现极其别扭，甚至比JS生成DOM还要难以使用。最关键的问题是**template的放置位置**：

1. **位置不一致性**：template必须放在DOM中某个固定位置，但克隆出的内容可能需要在完全不同的位置渲染
2. **清理风险**：页面切换或组件卸载时，容易误删重要的template，导致后续无法创建新实例
3. **维护负担**：需要额外的逻辑来保护template不被意外删除

比如，在页面切换时：
```javascript
// 危险：可能误删template
function clearPage() {
  pageContainer.innerHTML = ''; // 模板也被清空了！
}

// 需要额外的保护逻辑
function clearPage() {
  const templates = pageContainer.querySelectorAll('template');
  const templateContents = Array.from(templates).map(t => t.outerHTML);
  pageContainer.innerHTML = '';
  pageContainer.insertAdjacentHTML('afterbegin', templateContents.join(''));
}
```

这种防御性编程大大增加了维护成本。模板和逻辑分离的理论优势，在实践中被实现复杂性完全抵消。

#### Web Components
**实现方式**：
```javascript
class CustomModal extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.render();
  }

  static get observedAttributes() {
    return ['title', 'open'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    this.render();
  }

  render() {
    this.shadowRoot.innerHTML = `<div class="modal"><!-- content --></div>`;
  }
}
```

**优势**：
- ✅ 标准化封装，基于浏览器原生标准
- ✅ Shadow DOM提供样式和逻辑隔离
- ✅ 可重用性强，可以像HTML标签一样使用

**劣势**：
- ❌ 浏览器兼容性问题，需要polyfill
- ❌ 学习曲线陡峭，生命周期和属性监听复杂
- ❌ 调试困难，Shadow DOM隔离影响调试
- ❌ 生态系统不成熟

**评估**：对于这个项目来说过于重量级。Web Components更适合大型框架或跨团队共享组件库。

#### JS生成DOM（最终选择）
**实现方式**：
```typescript
interface ModalOptions {
  title: string;
  content: string | HTMLElement;
  actions?: ModalAction[];
}

class Modal {
  constructor(options: ModalOptions) {
    this.element = this.createElement(options);
    this.bindEvents();
  }

  private createElement(options: ModalOptions): HTMLElement {
    const modal = document.createElement('div');
    modal.innerHTML = `
      <div class="modal-content">
        <h3>${options.title}</h3>
        <div class="modal-body"><!-- content --></div>
        <!-- actions -->
      </div>
    `;
    return modal;
  }

  show() { document.body.appendChild(this.element); }
  close() { this.element.remove(); }
}
```

**优势**：
- ✅ 与现有代码风格完美一致，无缝集成
- ✅ TypeScript支持良好，完整的类型检查
- ✅ 逻辑清晰，UI生成和事件绑定集中管理
- ✅ 性能良好，没有额外的抽象层开销
- ✅ 调试友好，生成的DOM直接可见

**劣势**：
- ❌ HTML结构隐藏在JS字符串中，不够直观

**实际体验**：虽然HTML结构不如模板清晰，但整体开发体验最好。代码组织清晰，类型安全有保障，维护成本最低。

**决策理由**：
1. **实用性优先**：与现有代码风格完美契合，学习成本为零
2. **开发效率**：快速实现，调试友好，迭代速度快
3. **类型安全**：TypeScript支持完善，避免运行时错误
4. **维护成本**：逻辑集中，容易理解和修改

### 重构策略选择

- **渐进式重构**：逐步重构而不是一次性大重构 ❌（被放弃）
- **保持现状**：在原有架构上打补丁继续开发 ❌（会导致问题恶化）
- **一次性重构**：全面重构架构并扩展功能 ✅（最终选择）

## 实施计划

1. **Phase 1**: 建立新的目录结构和基础架构
2. **Phase 2**: 迁移现有功能到新架构
3. **Phase 3**: 开发新功能（导入、导出）
4. **Phase 4**: 测试和优化

## 实施指南

### 组件开发规范

1. **类型定义**：每个组件都有完整的TypeScript接口定义参数和返回值
2. **命名约定**：组件类名和文件名保持一致，遵循PascalCase命名
3. **事件处理**：统一的事件绑定和清理机制，避免内存泄漏
4. **样式隔离**：使用特定的CSS类名前缀避免全局样式冲突
5. **错误处理**：适当的参数验证和错误边界处理

### 代码组织结构

```
src/components/
├── ComponentName/
│   ├── ComponentName.ts    # 组件逻辑和类型定义
│   └── ComponentName.css   # 组件私有样式
```

### 组件生命周期

1. **创建阶段**：参数验证，DOM元素创建，事件绑定
2. **使用阶段**：显示/隐藏控制，状态更新
3. **销毁阶段**：事件解绑，DOM元素清理

## 验收标准

- ✅ 所有原有功能正常工作
- ✅ 新增导入导出功能可用
- ✅ 代码行数控制在合理范围内
- ✅ 架构文档更新完整
- ✅ 组件可复用性良好，样式隔离正常
