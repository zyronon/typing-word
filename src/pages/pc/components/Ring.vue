<template>
  <div class="ring">
    <svg height="100%" width="100%">
      <circle class="circle-full"
              cx="2.5rem"
              cy="2.5rem"
              r="2.2rem"
              fill="none"
              stroke-width=".3rem"
              stroke-linecap="round"></circle>
      <circle v-if="props.percentage" ref="circleEl"
              class="circle-detail"
              cx="2.5rem"
              cy="2.5rem"
              r="2.2rem"
              fill="none"
              stroke-width=".3rem"
              stroke-linecap="round"
              stroke-dasharray="0,10000"></circle>
    </svg>
    <span class="value">{{ props.value }}</span>
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
    let circleLength = Math.floor(2 * Math.PI * 40);
    let val = Number(props.percentage.toFixed(0));
    circleEl.setAttribute("stroke-dasharray", "" + circleLength * val / 100 + "px,10000");
  }
})
</script>
<style scoped lang="scss">
@import "@/assets/css/variable";

$w: 5rem;
$w2: calc($w / 2);

.ring {
  font-size: 1rem;
  width: $w;
  height: $w;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  position: relative;
  margin-bottom: .38rem;

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

  .value {

  }

  .desc {
    font-size: .8rem;
    opacity: .6;
  }
}
</style>