import mitt from 'mitt'
import {onMounted, onUnmounted} from "vue";

export const emitter = mitt()
export const EventKey = {
  resetWord: 'resetWord',
  changeDict: 'changeDict',
  openStatModal: 'openStatModal',
  openWordListModal: 'openWordListModal',
  openArticleContentModal: 'openArticleContentModal',
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

export function useEvent(key: string, func: () => void) {
  onMounted(() => {
    emitter.on(key, func)
  })

  onUnmounted(() => {
    emitter.off(key, func)
  })
}