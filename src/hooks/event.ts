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

export function useEventListener(type: string, listener: EventListenerOrEventListenerObject) {
    onMounted(() => window.addEventListener(type, listener))
    onUnmounted(() => window.removeEventListener(type, listener))
}

export function useEsc(can: boolean) {
    onMounted(() => {
        window.addEventListener('keyup', (e: KeyboardEvent) => {
            if (e.key === 'Escape' && can) {
                close()
            }
        })
    })
    return []
}