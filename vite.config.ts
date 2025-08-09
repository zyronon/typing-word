import {defineConfig, UserConfig} from 'vite'
import Vue from '@vitejs/plugin-vue'
import VueJsx from "@vitejs/plugin-vue-jsx";
import {resolve} from 'path'
import {visualizer} from "rollup-plugin-visualizer";
import SlidePlugin from './src/components/slide/data.js';
import {getLastCommit} from "git-last-commit";
import UnoCSS from 'unocss/vite'
import VueMacros from 'unplugin-vue-macros/vite'
import {Plugin as importToCDN} from 'vite-plugin-cdn-import'
import ElementPlus from 'unplugin-element-plus/vite'

function pathResolve(dir: string) {
  return resolve(__dirname, ".", dir)
}

const lifecycle = process.env.npm_lifecycle_event;

// https://vitejs.dev/config/
export default defineConfig(() => {
  return new Promise(resolve => {
    let latestCommitHash = ''
    getLastCommit((err, commit) => {
      if (!err) latestCommitHash = commit.shortHash
    })
    resolve({
      plugins: [
        VueMacros({
          plugins: {
            vue: Vue(),
            vueJsx: VueJsx(), // 如果需要
          },
        }),
        UnoCSS(),
        ElementPlus(),
        lifecycle === 'report' ?
          visualizer({
            gzipSize: true,
            brotliSize: true,
            emitFile: false,
            filename: "report.html", //分析图生成的文件名
            open: true //如果存在本地服务端口，将在打包后自动展示
          }) : null,
        SlidePlugin(),
        importToCDN({
          modules: [
            {
              name: 'vue',
              var: 'Vue',
              path: `https://cdn.jsdelivr.net/npm/vue@3.5.14/dist/vue.global.prod.min.js`
            },
            {
              name: 'vue-router',
              var: 'VueRouter',
              path: `https://cdn.jsdelivr.net/npm/vue-router@4.5.1/dist/vue-router.global.prod.min.js`
            },
            {
              name: 'axios',
              var: 'axios',
              path: 'https://cdn.jsdelivr.net/npm/axios@1.9.0/dist/axios.min.js'
            },
          ]
        })
      ],
      define: {
        LATEST_COMMIT_HASH: JSON.stringify(latestCommitHash + (process.env.NODE_ENV === 'production' ? '' : ' (dev)')),
      },
      //默认是'',导致只能在一级域名下使用。
      base: './',
      resolve: {
        alias: {
          "@": pathResolve("src"),
        },
        extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue']
      },
      // build: {
      //   rollupOptions: {
      //     external: ['axios'],// 使用全局的 axios。因为百度翻译库内部用了0.19版本的axios，会被打包到代码里面
      //   }
      // },
      css: {
        preprocessorOptions: {
          scss: {
            //解决 sass 控制台出现 Deprecation Warning: The legacy JS API is deprecated and will be removed in Dart Sass 2.0.0 的问题
            api: "modern-compiler" // or 'modern'
          }
        }
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
  })
})
