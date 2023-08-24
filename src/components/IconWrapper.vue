<script lang="jsx">
export default {
  render() {
    let Vnode = this.$slots.default()[0]
    return (
        <div class="icon-wrapper">
          <Vnode
          />
        </div>
    )
  }
}
</script>

<style scoped lang="scss">
@import "@/assets/css/colors";

$w: 20rem;
.icon-wrapper {
  padding: 2rem;
  //width: 24rem;
  //height: 24rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 3rem;
  background: transparent;
  transition: all .3s;
  color: $main;

  &:hover {
    background: $main;
    color: white;
  }

  ::v-deep svg {
    width: $w;
    height: $w;
  }
}
</style>