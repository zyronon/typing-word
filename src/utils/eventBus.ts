import mitt from 'mitt'

export const emitter = mitt()
export const EventKey = {
  resetWord: 'resetWord',
  openStatModal: 'openStatModal',
  openWordListModal: 'openWordListModal',
  closeOther: 'closeOther',
  keydown: 'keydown',
  keyup: 'keyup',
}