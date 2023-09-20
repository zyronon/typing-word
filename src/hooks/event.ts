import {onMounted, onUnmounted} from "vue";
import {emitter, EventKey} from "@/utils/eventBus.ts";
import {useRuntimeStore} from "@/stores/runtime.ts";

export function useWindowClick(cb: () => void) {
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

export function useDisableEventListener() {
    const runtimeStore = useRuntimeStore()
    onMounted(() => {
        runtimeStore.disableEventListener = true
    })
    onUnmounted(() => {
        runtimeStore.disableEventListener = false
    })
}

export function useEsc(close: () => void) {
    onMounted(() => {
        window.addEventListener('keyup', (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                close()
            }
        })
    })
}

