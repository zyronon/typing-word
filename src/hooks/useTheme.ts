import {useBaseStore} from "@/stores/base.ts";

export default function useTheme() {
  const store = useBaseStore()

  function toggle() {
    if (store.theme === 'auto') {
      store.theme = 'dark'
    } else {
      store.theme = store.theme === 'light' ? 'dark' : 'light'
    }
    document.documentElement.setAttribute('data-theme', store.theme)
  }

  return {
    toggle
  }
}
