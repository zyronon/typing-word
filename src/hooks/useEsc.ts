import {onMounted} from "vue"

export function useEsc(can: boolean) {
    onMounted(() => {
        window.addEventListener('keyup', (e: KeyboardEvent) => {
            if (e.key === 'Escape' && can) {
                close()
            }
        })
    })
    return [useEsc()]
}