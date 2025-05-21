import mitt from 'mitt'
import {onMounted, onUnmounted} from "vue";

export const emitter = mitt()
export const EventKey = {
  resetWord: 'resetWord',
  changeDict: 'changeDict',
  openStatModal: 'openStatModal',
  openWordListModal: 'openWordListModal',
  openDictModal: 'openDictModal',
  openArticleListModal: 'openArticleListModal',
  closeOther: 'closeOther',
  keydown: 'keydown',
  keyup: 'keyup',
  onTyping: 'onTyping',
  repeat: 'repeat',
  next: 'next',
  write: 'write',
  editDict: 'editDict',
  openMyDictDialog: 'openMyDictDialog',
  jumpSpecifiedChapter: 'jumpSpecifiedChapter',
}

export function useEvent(key: string, func: any) {
  onMounted(() => {
    emitter.on(key, func)
  })

  onUnmounted(() => {
    emitter.off(key, func)
  })
}

export function useEvents(arrs: any[],) {
  onMounted(() => {
    arrs.map((arr) => emitter.on(arr[0], arr[1]))
  })

  onUnmounted(() => {
    arrs.map((arr) => emitter.off(arr[0], arr[1]))
  })
}