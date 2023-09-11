import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from "@vitejs/plugin-vue-jsx";
import {resolve} from 'path'
import Icons from 'unplugin-icons/vite'

function pathResolve(dir) {
  return resolve(__dirname, ".", dir)
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue({
      reactivityTransform: true
    }),
    Icons(),
    vueJsx(),
  ],
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
