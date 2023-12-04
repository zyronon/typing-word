<template>
  <div class="icon-wrapper">
    <slot></slot>
  </div>
</template>

<style scoped lang="scss">

$w: 22rem;
.icon-wrapper {
  //padding: 2rem;
  width: 26rem;
  height: 26rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 3rem;
  background: transparent;
  transition: all .3s;
  color: var(--color-main-active);

  &:hover {
    background: var(--color-main-active);
    color: white;
  }

  :deep(svg) {
    width: $w;
    height: $w;
  }
}
</style>