import {createApp} from 'vue'
import Modal from "@/components/Modal/Modal.vue";

export class MessageBox {
  static confirm(
    content: string,
    title: string,
    onOk: () => any = () => void 0,
    onCancel: () => any = () => void 0,
  ) {
    let remove = () => {
      let parent = document.querySelector('.dialog-ctn')
      parent.remove()
    }
    let tempOnCancel = () => {
      remove()
      onCancel()
    }

    const app = createApp({
      render() {
        return <Modal
          footer={true}
          title={title}
          onOk={onOk}
          padding={true}
          onCancel={tempOnCancel}
        >
          <div style=' width: 350rem;color: black;'>{content}</div>
        </Modal>
      },
    })
    let parent = document.createElement('div')
    parent.classList.add(...['dialog-ctn'])
    document.body.append(parent)
    app.mount(parent)
  }

  static notice(
    content: string,
    title: string,
  ) {
    let remove = () => {
      let parent = document.querySelector('.dialog-ctn')
      parent.remove()
    }
    let tempOnCancel = () => {
      remove()
    }

    const app = createApp({
      render() {
        return <Modal
          footer={false}
          title={title}
          padding={true}
          onCancel={tempOnCancel}
        >
          <div style=' width: 350rem;color: black;'>{content}</div>
        </Modal>
      },
    })
    let parent = document.createElement('div')
    parent.classList.add(...['dialog-ctn'])
    document.body.append(parent)
    app.mount(parent)
  }
}