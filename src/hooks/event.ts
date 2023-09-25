import {onMounted, onUnmounted, toRef, toValue, watch} from "vue";
import {emitter, EventKey} from "@/utils/eventBus.ts";
import {useRuntimeStore} from "@/stores/runtime.ts";
import {$ref} from "vue/macros";

export function useWindowClick(cb: (e: PointerEvent) => void) {
  onMounted(() => {
    emitter.on(EventKey.closeOther, cb)
    window.addEventListener('click', cb)
  })
  onUnmounted(() => {
    window.removeEventListener('click', cb)
  })
}

export function useEventListener(type: string, listener: EventListenerOrEventListenerObject) {
  onMounted(() => window.addEventListener(type, listener))
  onUnmounted(() => window.removeEventListener(type, listener))
}

export function useStartKeyboardEventListener() {
  const runtimeStore = useRuntimeStore()

  useEventListener('keydown', (e: KeyboardEvent) => {
    if (!runtimeStore.disableEventListener) {
      emitter.emit(EventKey.keydown, e)
    }
  })
  useEventListener('keyup', (e: KeyboardEvent) => {
    if (!runtimeStore.disableEventListener) {
      emitter.emit(EventKey.keyup, e)
    }
  })
}

export function useOnKeyboardEventListener(onKeyDown: (e: KeyboardEvent) => void, onKeyUp: (e: KeyboardEvent) => void) {
  onMounted(() => {
    emitter.on(EventKey.keydown, onKeyDown)
    emitter.on(EventKey.keyup, onKeyUp)
  })
  onUnmounted(() => {
    emitter.off(EventKey.keydown, onKeyDown)
    emitter.off(EventKey.keyup, onKeyUp)
  })
}

export function useDisableEventListener(watchVal?: any) {
  const runtimeStore = useRuntimeStore()
  watch(watchVal, n => {
    if (n) {
      runtimeStore.disableEventListener = true
    } else {
      runtimeStore.disableEventListener = false
    }
  })
  onMounted(() => {
    if (!watchVal) {
      runtimeStore.disableEventListener = true
    }
  })
  onUnmounted(() => {
    if (!watchVal) {
      runtimeStore.disableEventListener = false
    }
  })
}

export function useEsc(close: () => void, watchVal?: any) {
  const runtimeStore = useRuntimeStore()
  const id = $ref(Date.now())

  watch(watchVal, n => {
    if (n) {
      runtimeStore.modalList.push({id, close})
    } else {
      let rIndex = runtimeStore.modalList.findIndex(item => item.id === id)
      if (rIndex > 0) {
        runtimeStore.modalList.splice(rIndex, 1)
      }
    }
  })

  onMounted(() => {
    if (watchVal() === undefined) {
      runtimeStore.modalList.push({id, close})
    }
  })

  onUnmounted(() => {
    if (watchVal() === undefined) {
      let rIndex = runtimeStore.modalList.findIndex(item => item.id === id)
      if (rIndex > 0) {
        runtimeStore.modalList.splice(rIndex, 1)
      }
    }
  })
}

