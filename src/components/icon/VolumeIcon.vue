<script setup lang="ts">
import BaseIcon from "@/components/BaseIcon.vue";

const props = withDefaults(defineProps<{
  time?: number,
  simple?: boolean
  cb?: Function
}>(), {
  time: 300,
  simple: false
})
const emit = defineEmits(['click'])

let step = $ref(2)
let count = $ref(0)

function play(time = props.time, reset = false) {
  if (reset) {
    step = 2
    count = 0
  }
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

let iconList = ['bx:volume', 'bx:volume-low', 'bx:volume-full']
defineExpose({play})

</script>

<template>
  <BaseIcon @click.stop="click"
            v-if="props.simple"
            no-bg
            :icon="iconList[step]"/>
  <BaseIcon @click.stop="click" v-else :icon="iconList[step]"/>
</template>

<style scoped lang="scss">
</style>
