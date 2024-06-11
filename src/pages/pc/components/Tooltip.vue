<script lang="jsx">
import {Teleport, Transition} from 'vue'

export default {
  name: "Tooltip",
  components: {
    Teleport,
    Transition
  },
  props: {
    title: {
      type: String,
      default() {
        return ''
      }
    },
    disabled: {
      type: Boolean,
      default() {
        return false
      }
    }
  },
  data() {
    return {
      show: false
    }
  },
  methods: {
    showPop(e) {
      if (this.disabled) return
      if (!this.title) return
      e.stopPropagation()
      let rect = e.target.getBoundingClientRect()
      this.show = true
      this.$nextTick(() => {
        let tip = this.$refs?.tip?.getBoundingClientRect()
        if (!tip) return
        if (rect.top < 50) {
          this.$refs.tip.style.top = rect.top + rect.height + 10 + 'px'
        } else {
          this.$refs.tip.style.top = rect.top - tip.height - 10 + 'px'
        }
        let tipWidth = tip.width
        let rectWidth = rect.width
        this.$refs.tip.style.left = rect.left - (tipWidth - rectWidth) / 2 + 'px'
        // onmouseleave={() => this.show = false}
      })
    },
  },
  render() {
    if (!this.title) return this.$slots.default()
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
      <Vnode
          onClick={() => this.show = false}
          onmouseenter={(e) => this.showPop(e)}
          onmouseleave={() => this.show = false}
      />
    </>
  }
}
</script>
<style lang="scss" scoped>
.tip {
  position: fixed;
  font-size: 0.9rem;
  z-index: 9999;
  border-radius: .3rem;
  padding: 0.4rem .8rem;
  color: var(--color-font-1);
  background: var(--color-tooltip-bg);
  //box-shadow: 1px 1px 6px #bbbbbb;
  box-shadow: 0 0 6px 1px var(--color-tooltip-shadow);
}
</style>
