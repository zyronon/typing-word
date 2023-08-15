<script lang="jsx">
import {nextTick, Teleport, Transition} from "vue";

export default {
  name: "Tooltip",
  props: {
    title: {
      type: String,
      default() {
        return ''
      }
    },
  },
  data() {
    return {
      show: false
    }
  },
  methods: {
    showPop(e) {
      e.stopPropagation()
      let rect = e.target.getBoundingClientRect()
      this.show = true
      nextTick(() => {
        let tip = this.$refs.tip.getBoundingClientRect()
        if (rect.top < 50) {
          this.$refs.tip.style.top = rect.top + tip.height - 10 + 'px'
        }else {
          this.$refs.tip.style.top = rect.top - tip.height - 10 + 'px'
        }
        let tipWidth = tip.width
        let rectWidth = rect.width
        this.$refs.tip.style.left = rect.left - (tipWidth - rectWidth) / 2 + 'px'
      })
    },
  },
  render() {
    let Vnode = this.$slots.default()[0]
    return <>
      <Teleport to="body">
        <Transition name="fade">
          {
              this.show && (
                  <div ref="tip" class="tip">
                    {this.title}
                  </div>
              )
          }
        </Transition>
      </Teleport>
      <Vnode ref='tip'
             onmouseenter={(e) => this.showPop(e)}
             onmouseleave={() => this.show = false}
      />
    </>
  }
}
</script>
<style lang="scss" scoped>
@import "@/assets/css/style.scss";

.tip {
  position: fixed;
  font-size: 14rem;
  z-index: 999;
  border-radius: 4rem;
  padding: 10rem;
  color: var(--color-font);
  background: var(--color-header-bg);
  box-shadow: 1px 1px 6px #bbbbbb;
}
</style>
