/**
 * scripts/ts-to-mts.mts
 *
 * 功能：将 .ts 重命名为 .mts
 * 特性：
 * 1. 使用 minimatch 支持 Glob 忽略模式
 * 2. 类型安全
 * 3. 自身也是 ESM 模块
 */

import {
  existsSync,
  readdirSync,
  readFileSync,
  renameSync,
  statSync,
} from "fs";
import { minimatch } from "minimatch";
import { basename, join, relative, resolve } from "path";

// 类型定义
interface Config {
  rootDir: string;
  ignore: string[];
}

let config: Config = { rootDir: "src", ignore: [] };
try {
  // 读取配置
  const configPath = resolve(import.meta.dirname, "../rename-ignore.json");
  if (existsSync(configPath)) {
    const rawData = readFileSync(configPath, "utf-8");
    config = JSON.parse(rawData);
    console.log("📖 已加载配置:", configPath);
  }
} catch (error) {
  console.error("⚠️ 配置加载失败，使用默认配置。", error);
}

const ROOT_DIR = resolve(import.meta.dirname, "..", config.rootDir);

// 统计
const stats = {
  success: 0,
  ignored: 0,
  failed: 0,
};

function isIgnored(relativePath: string) {
  return config.ignore.some((pattern) => minimatch(relativePath, pattern));
}

// 递归遍历文件夹
function walk(dir: string) {
  const files = readdirSync(dir);
  for (const file of files) {
    const fullPath = join(dir, file);
    const relativePath = relative(ROOT_DIR, fullPath);
    const stat = statSync(fullPath);
    // 目录也可以被忽略
    if (stat.isDirectory()) {
      if (isIgnored(relativePath + "/")) {
        console.log(`🛡️  跳过目录: ${relativePath}`);
        stats.ignored++;
        continue;
      }
      walk(fullPath);
    } else {
      if (isIgnored(relativePath)) {
        console.log(`🛡️  忽略文件: ${relativePath}`);
        stats.ignored++;
        continue;
      }
      if (file.endsWith(".ts")) {
        const newPath = fullPath.replace(/\.ts$/, ".mts");
        try {
          renameSync(fullPath, newPath);
          console.log(`✅ 重命名: ${relativePath} -> ${basename(newPath)}`);
          stats.success++;
        } catch (err) {
          console.error(`❌ 失败: ${relativePath}`, err);
          stats.failed++;
        }
      }
    }
  }
}

// 主流程
console.log(`🚀 开始扫描: ${ROOT_DIR}`);

if (existsSync(ROOT_DIR)) {
  walk(ROOT_DIR);
  console.log("\n--- 执行报告 ---");
  console.log(`✅ 成功迁移: ${stats.success}`);
  console.log(`🛡️ 命中忽略: ${stats.ignored}`);

  if (stats.failed > 0) {
    console.log(`❌ 失败数量: ${stats.failed}`);
  }
} else {
  console.error(`❌ 找不到源码目录: ${ROOT_DIR}`);
}
