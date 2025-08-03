<template>
  <div class="icon-wrapper">
    <slot></slot>
  </div>
</template>

<style scoped lang="scss">

$w: 1.4rem;
.icon-wrapper {
  cursor: pointer;
  //padding: 2rem;
  width: 2rem;
  height: 2rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: .3rem;
  background: transparent;
  transition: all .3s;

  &:hover {
    background: var(--color-primary);
    color: white;
  }

  :deep(svg) {
    width: $w;
    height: $w;
  }
}
</style>
