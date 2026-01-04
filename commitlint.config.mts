export default {
  // 继承预设
  extends: ["@commitlint/config-conventional"],

  // 自定义解析器选项（支持 git emoji 前缀）
  parserPreset: {
    parserOpts: {
      // 支持 emoji 前缀的正则表达式
      // 匹配格式：[emoji] type(scope): subject 或 type(scope): subject
      headerPattern:
        /^(?:(?<emoji>[\p{Emoji_Presentation}\p{Extended_Pictographic}]+)\s)?(?<type>\w+)(?:\((?<scope>[\w-]+)\))?:\s(?<subject>.+)$/u,
      headerCorrespondence: ["emoji", "type", "scope", "subject"],
    },
  },
  // 自定义规则
  rules: {
    // 允许的提交类型
    "type-enum": [
      2, // 错误级别
      "always", // 始终应用
      [
        "feat", // 新功能
        "fix", // 修复 bug
        "docs", // 文档变更
        "style", // 代码格式（不影响功能）
        "refactor", // 重构
        "perf", // 性能优化
        "test", // 测试相关
        "chore", // 构建/工具变动
        "revert", // 回滚提交
        "build", // 构建系统变更
        "ci", // CI/CD 配置
        "setup", // 项目初始化
      ],
    ],

    // 主题大小写规则
    "subject-case": [0], // 禁用，允许任意大小写

    // 标题长度限制（考虑 emoji 占用字符）
    "header-max-length": [2, "always", 100], // 限制标题最大 100 字符
  },
};
