<script setup lang="ts">
import {Close} from "@icon-park/vue-next"

const props = defineProps(['modelValue'])
const emit = defineEmits(['update:modelValue'])

function close() {
  emit('update:modelValue', false)
}
</script>

<template>
  <Teleport to="body">
    <Transition name="bounce">
      <div class="modal-root" v-if="props.modelValue">
        <div class="modal-mask" @click="close"></div>
        <div class="modal">
          <Close @click="close"
                 class="close"
                 theme="outline" size="20" fill="#929596"
                 :strokeWidth="2"/>
          <div class="modal-body">
            <slot></slot>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped lang="scss">
@import "@/assets/css/colors.scss";

.bounce-enter-active {
  animation: fade-in 0.3s;
}

.bounce-enter-active .modal {
  animation: bounce-in 0.3s;
}

.bounce-leave-active {
  animation: fade-in 0.3s reverse;
}

.bounce-leave-active .modal {
  animation: bounce-out 0.3s;
}

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

@keyframes bounce-out {
  0% {
    opacity: 1;
    transform: scale(1);
  }
  100% {
    opacity: 0;
    transform: scale(0);
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

$modal-mask-bg: rgba(#000, .45);
$radius: 16rem;
$time: 0.3s;
$header-height: 60rem;

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
  }

  .modal {
    position: relative;
    background: $dark-second-bg;
    box-shadow: $dark-second-bg 0 0 10rem 1rem;
    //width: 75vw;
    //height: 70vh;
    border-radius: $radius;
    display: flex;
    flex-direction: column;

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: $header-height;
      padding: 0 $space;
      border-radius: $radius $radius 0 0;

      .title {
        color: #ffffff;
        font-weight: 500;
        font-size: 28rem;
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
    }
  }

  .close {
    position: absolute;
    right: 20rem;
    top: 20rem;
  }
}
</style>