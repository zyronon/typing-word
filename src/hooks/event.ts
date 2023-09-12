import {onMounted, onUnmounted} from "vue";
import {emitter, EventKey} from "@/utils/eventBus.ts";

export function useWindowClick(cb: () => void) {
  onMounted(() => {
    emitter.on(EventKey.closeOther, cb)
    window.addEventListener('click', cb)
  })
  onUnmounted(() => {
    window.removeEventListener('click', cb)
  })
}