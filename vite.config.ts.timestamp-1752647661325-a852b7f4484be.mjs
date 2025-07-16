// vite.config.ts
import { defineConfig } from "file:///app/node_modules/vite/dist/node/index.js";
import vue from "file:///app/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import vueJsx from "file:///app/node_modules/@vitejs/plugin-vue-jsx/dist/index.mjs";
import { resolve } from "path";
import { visualizer } from "file:///app/node_modules/rollup-plugin-visualizer/dist/plugin/index.js";
import { ElementPlusResolver } from "file:///app/node_modules/unplugin-vue-components/dist/resolvers.mjs";
import AutoImport from "file:///app/node_modules/unplugin-auto-import/dist/vite.js";
import Components from "file:///app/node_modules/unplugin-vue-components/dist/vite.mjs";
import { getLastCommit } from "file:///app/node_modules/git-last-commit/source/index.js";
var __vite_injected_original_dirname = "/app";
function pathResolve(dir) {
  return resolve(__vite_injected_original_dirname, ".", dir);
}
var lifecycle = process.env.npm_lifecycle_event;
var vite_config_default = defineConfig(async () => {
  const latestCommitHash = await new Promise((resolve2) => {
    return getLastCommit((err, commit) => err ? "unknown" : resolve2(commit.shortHash));
  });
  return {
    plugins: [
      vue({
        reactivityTransform: true
      }),
      AutoImport({
        resolvers: [ElementPlusResolver()]
      }),
      Components({
        resolvers: [ElementPlusResolver()]
      }),
      vueJsx(),
      lifecycle === "report" ? visualizer({
        gzipSize: true,
        brotliSize: true,
        emitFile: false,
        filename: "report.html",
        //分析图生成的文件名
        open: true
        //如果存在本地服务端口，将在打包后自动展示
      }) : null
    ],
    define: {
      LATEST_COMMIT_HASH: JSON.stringify(latestCommitHash + (process.env.NODE_ENV === "production" ? "" : " (dev)"))
    },
    //默认是'',导致只能在一级域名下使用。
    base: "./",
    resolve: {
      alias: {
        "@": pathResolve("src")
      },
      extensions: [".mjs", ".js", ".ts", ".jsx", ".tsx", ".json", ".vue"]
    },
    server: {
      port: 3e3,
      open: false,
      host: "0.0.0.0",
      fs: {
        strict: false
      },
      proxy: {
        "/baidu": "https://api.fanyi.baidu.com/api/trans/vip/translate"
      }
    }
  };
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvYXBwXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvYXBwL3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9hcHAvdml0ZS5jb25maWcudHNcIjtpbXBvcnQge2RlZmluZUNvbmZpZ30gZnJvbSAndml0ZSdcbmltcG9ydCB2dWUgZnJvbSAnQHZpdGVqcy9wbHVnaW4tdnVlJ1xuaW1wb3J0IHZ1ZUpzeCBmcm9tIFwiQHZpdGVqcy9wbHVnaW4tdnVlLWpzeFwiO1xuaW1wb3J0IHtyZXNvbHZlfSBmcm9tICdwYXRoJ1xuaW1wb3J0IHt2aXN1YWxpemVyfSBmcm9tIFwicm9sbHVwLXBsdWdpbi12aXN1YWxpemVyXCI7XG5pbXBvcnQge0VsZW1lbnRQbHVzUmVzb2x2ZXJ9IGZyb20gXCJ1bnBsdWdpbi12dWUtY29tcG9uZW50cy9yZXNvbHZlcnNcIjtcbmltcG9ydCBBdXRvSW1wb3J0IGZyb20gJ3VucGx1Z2luLWF1dG8taW1wb3J0L3ZpdGUnXG5pbXBvcnQgQ29tcG9uZW50cyBmcm9tICd1bnBsdWdpbi12dWUtY29tcG9uZW50cy92aXRlJ1xuaW1wb3J0IHtnZXRMYXN0Q29tbWl0fSBmcm9tIFwiZ2l0LWxhc3QtY29tbWl0XCI7XG5cbmZ1bmN0aW9uIHBhdGhSZXNvbHZlKGRpcjpzdHJpbmcpIHtcbiAgcmV0dXJuIHJlc29sdmUoX19kaXJuYW1lLCBcIi5cIiwgZGlyKVxufVxuXG5jb25zdCBsaWZlY3ljbGUgPSBwcm9jZXNzLmVudi5ucG1fbGlmZWN5Y2xlX2V2ZW50O1xuXG5cbi8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoYXN5bmMgKCkgPT4ge1xuICBjb25zdCBsYXRlc3RDb21taXRIYXNoID0gYXdhaXQgbmV3IFByb21pc2U8c3RyaW5nPigocmVzb2x2ZSkgPT4ge1xuICAgIHJldHVybiBnZXRMYXN0Q29tbWl0KChlcnIsIGNvbW1pdCkgPT4gKGVyciA/ICd1bmtub3duJyA6IHJlc29sdmUoY29tbWl0LnNob3J0SGFzaCkpKVxuICB9KVxuICByZXR1cm4ge1xuICAgIHBsdWdpbnM6IFtcbiAgICAgIHZ1ZSh7XG4gICAgICAgIHJlYWN0aXZpdHlUcmFuc2Zvcm06IHRydWVcbiAgICAgIH0pLFxuICAgICAgQXV0b0ltcG9ydCh7XG4gICAgICAgIHJlc29sdmVyczogW0VsZW1lbnRQbHVzUmVzb2x2ZXIoKV0sXG4gICAgICB9KSxcbiAgICAgIENvbXBvbmVudHMoe1xuICAgICAgICByZXNvbHZlcnM6IFtFbGVtZW50UGx1c1Jlc29sdmVyKCldLFxuICAgICAgfSksXG4gICAgICB2dWVKc3goKSxcbiAgICAgIGxpZmVjeWNsZSA9PT0gJ3JlcG9ydCcgP1xuICAgICAgICB2aXN1YWxpemVyKHtcbiAgICAgICAgICBnemlwU2l6ZTogdHJ1ZSxcbiAgICAgICAgICBicm90bGlTaXplOiB0cnVlLFxuICAgICAgICAgIGVtaXRGaWxlOiBmYWxzZSxcbiAgICAgICAgICBmaWxlbmFtZTogXCJyZXBvcnQuaHRtbFwiLCAvL1x1NTIwNlx1Njc5MFx1NTZGRVx1NzUxRlx1NjIxMFx1NzY4NFx1NjU4N1x1NEVGNlx1NTQwRFxuICAgICAgICAgIG9wZW46IHRydWUgLy9cdTU5ODJcdTY3OUNcdTVCNThcdTU3MjhcdTY3MkNcdTU3MzBcdTY3MERcdTUyQTFcdTdBRUZcdTUzRTNcdUZGMENcdTVDMDZcdTU3MjhcdTYyNTNcdTUzMDVcdTU0MEVcdTgxRUFcdTUyQThcdTVDNTVcdTc5M0FcbiAgICAgICAgfSkgOiBudWxsLFxuICAgIF0sXG4gICAgZGVmaW5lOiB7XG4gICAgICBMQVRFU1RfQ09NTUlUX0hBU0g6IEpTT04uc3RyaW5naWZ5KGxhdGVzdENvbW1pdEhhc2ggKyAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgPT09ICdwcm9kdWN0aW9uJyA/ICcnIDogJyAoZGV2KScpKSxcbiAgICB9LFxuICAgIC8vXHU5RUQ4XHU4QkE0XHU2NjJGJycsXHU1QkZDXHU4MUY0XHU1M0VBXHU4MEZEXHU1NzI4XHU0RTAwXHU3RUE3XHU1N0RGXHU1NDBEXHU0RTBCXHU0RjdGXHU3NTI4XHUzMDAyXG4gICAgYmFzZTogJy4vJyxcbiAgICByZXNvbHZlOiB7XG4gICAgICBhbGlhczoge1xuICAgICAgICBcIkBcIjogcGF0aFJlc29sdmUoXCJzcmNcIiksXG4gICAgICB9LFxuICAgICAgZXh0ZW5zaW9uczogWycubWpzJywgJy5qcycsICcudHMnLCAnLmpzeCcsICcudHN4JywgJy5qc29uJywgJy52dWUnXVxuICAgIH0sXG4gICAgc2VydmVyOiB7XG4gICAgICBwb3J0OiAzMDAwLFxuICAgICAgb3BlbjogZmFsc2UsXG4gICAgICBob3N0OiAnMC4wLjAuMCcsXG4gICAgICBmczoge1xuICAgICAgICBzdHJpY3Q6IGZhbHNlLFxuICAgICAgfSxcbiAgICAgIHByb3h5OiB7XG4gICAgICAgICcvYmFpZHUnOiAnaHR0cHM6Ly9hcGkuZmFueWkuYmFpZHUuY29tL2FwaS90cmFucy92aXAvdHJhbnNsYXRlJ1xuICAgICAgfVxuICAgIH1cbiAgfVxufSlcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBOEwsU0FBUSxvQkFBbUI7QUFDek4sT0FBTyxTQUFTO0FBQ2hCLE9BQU8sWUFBWTtBQUNuQixTQUFRLGVBQWM7QUFDdEIsU0FBUSxrQkFBaUI7QUFDekIsU0FBUSwyQkFBMEI7QUFDbEMsT0FBTyxnQkFBZ0I7QUFDdkIsT0FBTyxnQkFBZ0I7QUFDdkIsU0FBUSxxQkFBb0I7QUFSNUIsSUFBTSxtQ0FBbUM7QUFVekMsU0FBUyxZQUFZLEtBQVk7QUFDL0IsU0FBTyxRQUFRLGtDQUFXLEtBQUssR0FBRztBQUNwQztBQUVBLElBQU0sWUFBWSxRQUFRLElBQUk7QUFJOUIsSUFBTyxzQkFBUSxhQUFhLFlBQVk7QUFDdEMsUUFBTSxtQkFBbUIsTUFBTSxJQUFJLFFBQWdCLENBQUNBLGFBQVk7QUFDOUQsV0FBTyxjQUFjLENBQUMsS0FBSyxXQUFZLE1BQU0sWUFBWUEsU0FBUSxPQUFPLFNBQVMsQ0FBRTtBQUFBLEVBQ3JGLENBQUM7QUFDRCxTQUFPO0FBQUEsSUFDTCxTQUFTO0FBQUEsTUFDUCxJQUFJO0FBQUEsUUFDRixxQkFBcUI7QUFBQSxNQUN2QixDQUFDO0FBQUEsTUFDRCxXQUFXO0FBQUEsUUFDVCxXQUFXLENBQUMsb0JBQW9CLENBQUM7QUFBQSxNQUNuQyxDQUFDO0FBQUEsTUFDRCxXQUFXO0FBQUEsUUFDVCxXQUFXLENBQUMsb0JBQW9CLENBQUM7QUFBQSxNQUNuQyxDQUFDO0FBQUEsTUFDRCxPQUFPO0FBQUEsTUFDUCxjQUFjLFdBQ1osV0FBVztBQUFBLFFBQ1QsVUFBVTtBQUFBLFFBQ1YsWUFBWTtBQUFBLFFBQ1osVUFBVTtBQUFBLFFBQ1YsVUFBVTtBQUFBO0FBQUEsUUFDVixNQUFNO0FBQUE7QUFBQSxNQUNSLENBQUMsSUFBSTtBQUFBLElBQ1Q7QUFBQSxJQUNBLFFBQVE7QUFBQSxNQUNOLG9CQUFvQixLQUFLLFVBQVUsb0JBQW9CLFFBQVEsSUFBSSxhQUFhLGVBQWUsS0FBSyxTQUFTO0FBQUEsSUFDL0c7QUFBQTtBQUFBLElBRUEsTUFBTTtBQUFBLElBQ04sU0FBUztBQUFBLE1BQ1AsT0FBTztBQUFBLFFBQ0wsS0FBSyxZQUFZLEtBQUs7QUFBQSxNQUN4QjtBQUFBLE1BQ0EsWUFBWSxDQUFDLFFBQVEsT0FBTyxPQUFPLFFBQVEsUUFBUSxTQUFTLE1BQU07QUFBQSxJQUNwRTtBQUFBLElBQ0EsUUFBUTtBQUFBLE1BQ04sTUFBTTtBQUFBLE1BQ04sTUFBTTtBQUFBLE1BQ04sTUFBTTtBQUFBLE1BQ04sSUFBSTtBQUFBLFFBQ0YsUUFBUTtBQUFBLE1BQ1Y7QUFBQSxNQUNBLE9BQU87QUFBQSxRQUNMLFVBQVU7QUFBQSxNQUNaO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogWyJyZXNvbHZlIl0KfQo=
