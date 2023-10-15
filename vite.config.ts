import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from "@vitejs/plugin-vue-jsx";
import {resolve} from 'path'
import {visualizer} from "rollup-plugin-visualizer";
import {ElementPlusResolver} from "unplugin-vue-components/resolvers";
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'

function pathResolve(dir) {
  return resolve(__dirname, ".", dir)
}

const lifecycle = process.env.npm_lifecycle_event;


// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue({
      reactivityTransform: true
    }),
    AutoImport({
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      resolvers: [ElementPlusResolver()],
    }),
    vueJsx(),
    lifecycle === 'report' ?
      visualizer({
        gzipSize: true,
        brotliSize: true,
        emitFile: false,
        filename: "report.html", //分析图生成的文件名
        open: true //如果存在本地服务端口，将在打包后自动展示
      }) : null,
  ],
  base:'./',
  resolve: {
    alias: {
      "@": pathResolve("src"),
    },
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue']
  },
  server: {
    port: 3000,
    open: false,
    host: '0.0.0.0',
    fs: {
      strict: false,
    },
    proxy: {
      '/baidu': 'https://api.fanyi.baidu.com/api/trans/vip/translate'
    }

  }
})
