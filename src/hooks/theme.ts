import {useSettingStore} from "@/stores/setting.ts";

export default function useTheme() {
  const settingStore = useSettingStore()

// // 查询当前系统主题颜色
//   const match: MediaQueryList = window.matchMedia("(prefers-color-scheme: dark)")
// // 监听系统主题变化
//   match.addEventListener('change', followSystem)
//
//   function followSystem() {
//     document.documentElement.className = match.matches ? 'dark' : 'light'
//   }


  function toggleTheme() {
    if (settingStore.theme === 'auto') {
      settingStore.theme = 'light'
    } else {
      settingStore.theme = settingStore.theme === 'light' ? 'dark' : 'light'
    }
    setTheme(settingStore.theme)
  }

  function setTheme(val) {
    document.documentElement.className = val
  }

  return {
    toggleTheme,
    setTheme
  }
}
