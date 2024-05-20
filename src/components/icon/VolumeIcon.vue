<script setup lang="ts">
import {Icon} from "@iconify/vue";

import IconWrapper from "@/pages/pc/components/IconWrapper.vue";
import Tooltip from "@/pages/pc/components/Tooltip.vue";
import {ShortcutKey} from "@/types.ts";
import {useSettingStore} from "@/stores/setting.ts";

const props = withDefaults(defineProps<{
  time?: number,
  simple?: boolean
  cb?: Function
}>(), {
  time: 300,
  simple: false
})
const emit = defineEmits(['click'])
const settingStore = useSettingStore()

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

defineExpose({play})
</script>

<template>
  <div class="center"
       v-if="props.simple"
       @click.stop="click">
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
  $w: 1.6rem;

  :deep(svg) {
    width: $w;
    height: $w;
  }
}
</style>