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
}