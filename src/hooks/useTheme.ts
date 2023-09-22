import {useBaseStore} from "@/stores/base.ts";
import {useSettingStore} from "@/stores/setting.ts";

export default function useTheme() {
  const settingStore = useSettingStore()

  function toggle() {
    if (settingStore.theme === 'auto') {
      settingStore.theme = 'dark'
    } else {
      settingStore.theme = settingStore.theme === 'light' ? 'dark' : 'light'
    }
    document.documentElement.setAttribute('data-theme', settingStore.theme)
  }

  return {
    toggle
  }
}
