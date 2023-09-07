// event.js
import {onMounted, onUnmounted} from 'vue'

export function useEventListener(type: string, listener: EventListenerOrEventListenerObject) {
  onMounted(() => window.addEventListener(type, listener))
  onUnmounted(() => window.removeEventListener(type, listener))
}