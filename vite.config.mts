import { dirname, resolve } from "node:path";
import { defineConfig } from "vite";
export default defineConfig(({ mode }) => {
  console.log(mode);
  return {
    server: {
      port: 9527,
      open: true,
    },
    resolve: {
      alias: {
        "@": resolve(import.meta.dirname, "src"),
      },
      extensions: [".mts", ".ts", ".json"],
    },
    build: {
      // 多页应用配置
      rollupOptions: {
        input: {
          home: resolve(import.meta.dirname, "index.html"),
          importQuestions: resolve(
            import.meta.dirname,
            "import-questions.html"
          ),
        },
        output: {
          manualChunks: (id) => {
            // 将 node_modules 单独打包 (Vendor Chunk)
            if (id.includes("node_modules")) {
              return "vendor";
            }
            // 提取公共逻辑 (Common Chunk)
            // 如果某个文件同时被 'src/core/' 或 'src/components/' 下的多个页面引用
            // Rollup 默认会自动提取共享块，但我们也可以手动强制归类
            // 这里我们通常依赖 Rollup 的自动分析即可。
            // 如果你想强制把 core 目录打包在一起：
            // if (id.includes('src/core')) {
            //   return 'core-utils';
            // }
          },
          // 优化产物文件名，使其更清晰
          chunkFileNames: "assets/[name]-[hash].js",
          entryFileNames: "assets/[name]-[hash].js",
          assetFileNames: "assets/[ext]/[name]-[hash].[ext]",
        },
      },

      // 压缩设置
      minify: mode === "development" ? false : "esbuild",
    },
  };
});
