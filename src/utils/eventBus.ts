import mitt from 'mitt'

export const emitter = mitt()
export const EventKey = {
  resetWord: 'resetWord',
  openSide: 'openSide',
  openStatModal: 'openStatModal',
  closeOther: 'closeOther',
}