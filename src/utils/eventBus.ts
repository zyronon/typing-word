import mitt from 'mitt'

export const emitter = mitt()
export const EventKey = {
  resetWord: 'resetWord',
  openStatModal: 'openStatModal',
  openWordListModal: 'openWordListModal',
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