<script setup lang="ts">
import {onMounted, onUnmounted, watch} from "vue";
import Tooltip from "@/pages/pc/components/Tooltip.vue";
import {Icon} from '@iconify/vue';
import {useEventListener} from "@/hooks/event.ts";

import BaseButton from "@/components/BaseButton.vue";
import {useRuntimeStore} from "@/stores/runtime.ts";

export interface ModalProps {
  modelValue?: boolean,
  showClose?: boolean,
  title?: string,
  content?: string,
  fullScreen?: boolean;
  padding?: boolean
  footer?: boolean
  header?: boolean
  confirmButtonText?: string
  cancelButtonText?: string,
  keyboard?: boolean,
  confirm?: any
  beforeClose?: any
}

const props = withDefaults(defineProps<ModalProps>(), {
  modelValue: undefined,
  showClose: true,
  fullScreen: false,
  footer: false,
  header: true,
  confirmButtonText: '确认',
  cancelButtonText: '取消',
  keyboard: true
})

const emit = defineEmits([
  'update:modelValue',
  'close',
  'ok',
  'cancel',
])

let confirmButtonLoading = $ref(false)
let zIndex = $ref(999)
let visible = $ref(false)
let openTime = $ref(Date.now())
let maskRef = $ref<HTMLDivElement>(null)
let modalRef = $ref<HTMLDivElement>(null)
const runtimeStore = useRuntimeStore()
let id = Date.now()

async function close() {
  if (!visible) {
    return
  }
  if (props.beforeClose) {
    if (!await props.beforeClose()) {
      return
    }
  }
  //记录停留时间，避免时间太短，弹框闪烁
  let stayTime = Date.now() - openTime;
  let closeTime = 300;
  if (stayTime < 500) {
    closeTime += 500 - stayTime;
  }
  return new Promise((resolve) => {
    setTimeout(() => {
      maskRef?.classList.toggle('bounce-out');
      modalRef?.classList.toggle('bounce-out');
    }, 500 - stayTime);

    setTimeout(() => {
      emit('update:modelValue', false)
      emit('close')
      visible = false
      resolve(true)
      let rIndex = runtimeStore.modalList.findIndex(item => item.id === id)
      if (rIndex > -1) {
        runtimeStore.modalList.splice(rIndex, 1)
      }
    }, closeTime)
  });
}

watch(() => props.modelValue, n => {
  // console.log('n', n)
  if (n) {
    id = Date.now()
    runtimeStore.modalList.push({id, close})
    zIndex = 999 + runtimeStore.modalList.length
    visible = true
  } else {
    close()
  }
})

onMounted(() => {
  // console.log('props.modelValue', props.modelValue)
  if (props.modelValue === undefined) {
    visible = true
    id = Date.now()
    runtimeStore.modalList.push({id, close})
    zIndex = 999 + runtimeStore.modalList.length
  }
})

onUnmounted(() => {
  if (props.modelValue === undefined) {
    visible = false
    let rIndex = runtimeStore.modalList.findIndex(item => item.id === id)
    if (rIndex > -1) {
      runtimeStore.modalList.splice(rIndex, 1)
    }
  }
})

useEventListener('keyup', async (e: KeyboardEvent) => {
  if (e.key === 'Escape' && props.keyboard) {
    let lastItem = runtimeStore.modalList[runtimeStore.modalList.length - 1]
    if (lastItem?.id === id) {
      await cancel()
    }
  }
})

async function ok() {
  if (props.confirm) {
    confirmButtonLoading = true
    await props.confirm()
    confirmButtonLoading = false
  }
  emit('ok')
  await close()
}

async function cancel() {
  emit('cancel')
  await close()
}

</script>

<template>
  <Teleport to="body">
    <div class="modal-root" :style="{'z-index': zIndex}" v-if="visible">
      <div class="modal-mask"
           ref="maskRef"
           v-if="!fullScreen"
           @click.stop="close"></div>
      <div class="modal"
           ref="modalRef"
           :class="[
                fullScreen?'full':'window'
            ]"
      >
        <Tooltip title="关闭">
          <Icon @click="close"
                v-if="showClose"
                class="close hvr-grow pointer"
                width="24" color="#929596"
                icon="ion:close-outline"/>
        </Tooltip>
        <div class="modal-header" v-if="header">
          <div class="title">{{ props.title }}</div>
        </div>
        <div class="modal-body" :class="{padding}">
          <slot></slot>
          <div v-if="content" class="content">{{ content }}</div>
        </div>
        <div class="modal-footer" v-if="footer">
          <div class="left">
          </div>
          <div class="right">
            <BaseButton type="link" @click="cancel">{{ cancelButtonText }}</BaseButton>
            <BaseButton
                :loading="confirmButtonLoading"
                @click="ok">{{ confirmButtonText }}
            </BaseButton>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped lang="scss">


$modal-mask-bg: rgba(#000, .45);
$radius: .5rem;
$time: 0.3s;
$header-height: 4rem;

@keyframes bounce-in {
  0% {
    opacity: 0;
    transform: scale(0);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes bounce-in-full {
  0% {
    transform: scale(1.5);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes fade-in {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}

.modal-root {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100vw;
  height: 100vh;
  overflow: hidden;

  .modal-mask {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: $modal-mask-bg;
    transition: background 0.3s;
    animation: fade-in $time;

    &.bounce-out {
      background: transparent;
    }
  }

  .window {
    //width: 75vw;
    //height: 70vh;
    box-shadow: var(--shadow);
    border-radius: $radius;
    animation: bounce-in $time ease-out;

    &.bounce-out {
      transform: scale(0);
      opacity: 0;
    }
  }

  .full {
    width: 100vw;
    height: 100vh;
    animation: bounce-in-full $time ease-out;

    &.bounce-out {
      transform: scale(1.5);
      opacity: 0;
    }
  }

  .modal {
    position: relative;
    background: var(--color-second-bg);
    overflow: hidden;
    display: flex;
    flex-direction: column;
    transition: transform $time, opacity $time;

    .close {
      position: absolute;
      right: 1.2rem;
      top: 1.2rem;
      z-index: 999;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.3rem 1.3rem 1rem;
      border-radius: $radius $radius 0 0;

      .title {
        color: var(--color-font-1);
        font-weight: bold;
        font-size: 1.3rem;
        line-height: 1.8rem;
      }
    }

    .modal-body {
      box-sizing: border-box;
      color: rgba(255, 255, 255, 0.8);
      font-weight: 400;
      font-size: 1.1rem;
      line-height: 1.7rem;
      width: 100%;
      flex: 1;
      overflow: hidden;
      display: flex;

      &.padding {
        padding: .2rem 1.6rem 1.6rem;
      }

      .content {
        width: 25rem;
        color: var(--color-font-1);
        padding: .2rem 1.6rem 1.6rem;
      }
    }

    .modal-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: .5rem 1.6rem;
      color: #fff;
      font-size: 1.1rem;
      background: rgba(0, 0, 0, .2);

      .left {
        display: flex;
        align-items: center;
        height: 100%;

        .text {
          color: white;
          font-size: 1rem;
          cursor: pointer;
        }

        &.active {
          .text {
            color: white;
          }
        }
      }

      .right {
        display: flex;
        flex: 1;
        align-items: center;
        justify-content: flex-end;
        height: 100%;
        gap: var(--space);
      }
    }
  }
}
</style>
