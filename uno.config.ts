// uno.config.ts
import {defineConfig, presetWind3} from 'unocss'

export default defineConfig({
  shortcuts: {
    'bg-primary': 'bg-[var(--color-primary)]',
    'bg-second': 'bg-[var(--color-second)]',
    'bg-third': 'bg-[var(--color-third)]',
    'bg-card-active': 'bg-[var(--color-card-active)]',
    'color-main': 'color-[var(--color-main-text)]',
    'gap-space': 'gap-[var(--space)]',
    'p-space': 'p-[var(--space)]',
    'px-space': 'px-[var(--space)]',
    'py-space': 'py-[var(--space)]',
  },
  presets: [
    presetWind3(),
  ],
})
