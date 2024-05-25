<template>
  <div class="round">
    <svg height="100%" width="100%">
      <circle class="circle-full"
              cx="3rem"
              cy="3rem"
              r="2.6rem"
              fill="none"
              stroke-width=".4rem"
              stroke-linecap="round"></circle>
      <circle v-if="props.percentage" ref="circleEl"
              class="circle-detail"
              cx="3rem"
              cy="3rem"
              r="2.6rem"
              fill="none"
              stroke-width=".4rem"
              stroke-linecap="round"
              stroke-dasharray="0,10000"></circle>
    </svg>
    <span class="text-2xl">{{ props.value }}</span>
    <span class="desc">{{ props.desc }}</span>
  </div>
</template>
<script setup lang="ts">
import {onMounted} from "vue"

const props = withDefaults(defineProps<{
  percentage?: number,
  value: string | number,
  desc: string,
}>(), {
  percentage: 90,
})

const circleEl = $ref(null)

onMounted(() => {
  if (props.percentage) {
    let circleLength = Math.floor(2 * Math.PI * 35);
    let val = Number(props.percentage.toFixed(0));
    circleEl.setAttribute("stroke-dasharray", "" + circleLength * val / 100 + "px,10000");
  }
})
</script>
<style scoped lang="scss">
@import "@/assets/css/variable";

$w: 6rem;
$w2: calc($w / 2);

.round {
  font-size: 1rem;
  width: $w;
  height: $w;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  position: relative;

  svg {
    position: absolute;

    .circle-full {
      $item-hover: rgb(75, 75, 75);
      stroke: $item-hover;
    }

    .circle-detail {
      transform-origin: $w2 $w2;
      transform: rotate(-90deg);
      stroke: var(--color-main-active);
    }
  }

}
</style>