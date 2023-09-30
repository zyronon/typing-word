<script setup lang="ts">
import {Icon} from "@iconify/vue";
import {$ref} from "vue/macros";
import IconWrapper from "@/components/IconWrapper.vue";

const props = withDefaults(defineProps<{ time?: number }>(), {
  time: 400
})
let step = $ref(2)
let count = $ref(0)
const emit = defineEmits(['click'])

function play(time = props.time) {
  setTimeout(() => {
    if (step === 2) {
      if (count === 0) {
        play(time + 100)
        step = 0
      } else {
        count = 0
      }
    } else {
      step++
      if (step === 2) {
        count++
        play(time + 100)
      } else {
        play(time + 100)
      }
    }
  }, time)
}

function click() {
  emit('click')
  play()
}
</script>

<template>
  <IconWrapper @click.stop="click">
    <div class="center">
      <Icon v-if="step === 0" icon="bx:volume"/>
      <Icon v-if="step === 1" icon="bx:volume-low"/>
      <Icon v-if="step === 2" icon="bx:volume-full"/>
    </div>
  </IconWrapper>
</template>

<style scoped lang="scss">
.center {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>