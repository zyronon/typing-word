// uno.config.ts
import {defineConfig, presetUno} from 'unocss'

export default defineConfig({
  content: {

    pipeline: {
      include: [
        './src/**/*.{html,vue,ts,js}',
        './index.html',
      ],
      exclude: [
        './node_modules/**/*',
        './dist/**/*',
        './.pnpm/**/*',
        './.output/**/*',
      ],
    },
  },
  presets: [
    presetUno(),
  ],
})
