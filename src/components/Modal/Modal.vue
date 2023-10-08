<script setup lang="ts">
import {onMounted, toRef, watch} from "vue";
import Tooltip from "@/components/Tooltip.vue";
import {Icon} from '@iconify/vue';
import {useEsc} from "@/hooks/event.ts";
import {$ref} from "vue/macros";
import BaseButton from "@/components/BaseButton.vue";

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
  cancelButtonText?: string
}

const props = withDefaults(defineProps<ModalProps>(), {
  modelValue: undefined,
  showClose: true,
  fullScreen: false,
  footer: false,
  header: true,
  confirmButtonText: '确认',
  cancelButtonText: '取消',
})

const emit = defineEmits([
  'update:modelValue',
  'close',
  'ok',
  'cancel',
])

let visible = $ref(false)
let openTime = $ref(Date.now())
let maskRef = $ref<HTMLDivElement>(null)
let modalRef = $ref<HTMLDivElement>(null)

function close() {
  if (!visible) {
    return
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
    }, closeTime)
  });
}

watch(() => props.modelValue, n => {
  // console.log('n', n)
  if (n) {
    visible = true
  } else {
    close()
  }
})

onMounted(() => {
  // console.log('props.modelValue', props.modelValue)
  if (props.modelValue === undefined) {
    visible = true
  }
})

useEsc(close, () => props.modelValue)

async function ok() {
  await close()
  emit('ok')
}

async function cancel() {
  await close()
  emit('cancel')
}

</script>

<template>
  <Teleport to="body">
    <div class="modal-root" v-if="visible">
      <div class="modal-mask"
           ref="maskRef"
           v-if="!fullScreen"
           @click.stop="close"></div>
      <div class="modal"
           ref="modalRef"
           :class="[
                fullScreen?'full':'window'
            ]"
           @click.stop="null"
      >
        <div class="modal-header" v-if="header">
          <div class="title">{{ props.title }}</div>
          <Tooltip title="关闭">
            <Icon @click="close"
                  v-if="showClose"
                  class="close hvr-grow pointer"
                  width="20" color="#929596"
                  icon="ion:close-outline"/>
          </Tooltip>
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
            <BaseButton @click="ok">{{ confirmButtonText }}</BaseButton>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped lang="scss">
@import "@/assets/css/variable.scss";

$modal-mask-bg: rgba(#000, .45);
$radius: 24rem;
$time: 0.3s;
$header-height: 60rem;

@keyframes bounce-in {
  0% {
    opacity: 0;
    transform: scale(0);
  }
  50% {
    transform: scale(1.15);
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
    box-shadow: var(--color-main-bg) 0 0 10rem 1rem;
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
    background: var(--color-main-bg);
    overflow: hidden;
    display: flex;
    flex-direction: column;
    transition: transform $time, opacity $time;

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 24rem 24rem 16rem;
      border-radius: $radius $radius 0 0;

      .title {
        color: var(--color-font-1);
        font-weight: bold;
        font-size: 24rem;
        line-height: 33rem;
      }
    }

    .modal-body {
      box-sizing: border-box;
      color: rgba(255, 255, 255, 0.8);
      font-weight: 400;
      font-size: 18rem;
      line-height: 27rem;
      width: 100%;
      flex: 1;
      overflow: hidden;
      display: flex;

      &.padding {
        padding: 4rem 24rem 24rem;
      }

      .content {
        width: 350rem;
        color: black;
        padding: 4rem 24rem 24rem;
      }
    }

    .modal-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16rem 24rem;
      color: #fff;
      font-size: 18rem;
      background: rgba(0, 0, 0, .2);
      border-radius: 0 0 24rem 24rem;

      .left {
        display: flex;
        align-items: center;
        height: 100%;

        .text {
          color: white;
          font-size: 16rem;
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
        gap: $space;
      }
    }
  }
}
</style>