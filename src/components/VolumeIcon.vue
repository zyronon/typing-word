<script setup lang="ts">
import {Icon} from "@iconify/vue";
import {$ref} from "vue/macros";
import IconWrapper from "@/components/IconWrapper.vue";

const props = withDefaults(defineProps<{
  time?: number,
  simple?: boolean
  cb?: Function
}>(), {
  time: 400,
  simple: false
})
let step = $ref(2)
let count = $ref(0)
const emit = defineEmits(['click'])

function play(time = props.time) {
  if (count === 0) {
    props?.cb?.()
  }
  count++
  setTimeout(() => {
    if (step === 2) {
      if (count === 1) {
        step = 0
        play(time + 100)
      } else {
        count = 0
      }
    } else {
      step++
      play(time + 100)
    }
  }, time)
}

function click() {
  emit('click')
  play()
}

defineExpose({play})
</script>

<template>
  <div class="center" @click.stop="click" v-if="props.simple">
    <Icon v-if="step === 0" icon="bx:volume"/>
    <Icon v-if="step === 1" icon="bx:volume-low"/>
    <Icon v-if="step === 2" icon="bx:volume-full"/>
  </div>
  <IconWrapper @click.stop="click" v-else>
    <div class="center">
      <Icon v-if="step === 0" icon="bx:volume"/>
      <Icon v-if="step === 1" icon="bx:volume-low"/>
      <Icon v-if="step === 2" icon="bx:volume-full"/>
    </div>
  </IconWrapper>
</template>

<style scoped lang="scss">
.center {
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  $w: 26rem;

  :deep(svg) {
    width: $w;
    height: $w;
  }
}
</style>