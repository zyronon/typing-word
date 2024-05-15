<script lang="jsx">
import {nextTick, Teleport, Transition} from "vue";

export default {
  name: "PopConfirm",
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
  mounted() {
    window.addEventListener('click', () => {
      this.show = false
    })
    window.addEventListener('keydown', () => {
      this.show = false
    })
  },
  methods: {
    showPop(e) {
      if (this.disabled) return
      e?.stopPropagation()
      let rect = e.target.getBoundingClientRect()
      this.show = true
      nextTick(() => {
        let tip = this.$refs?.tip?.getBoundingClientRect()
        console.log('rect', rect, tip)
        if (!tip) return
        if (rect.top < 150) {
          this.$refs.tip.style.top = rect.top + rect.height + tip.height + 30 + 'px'
        } else {
          this.$refs.tip.style.top = rect.top - 10 + 'px'
        }
        this.$refs.tip.style.left = rect.left + rect.width / 2 - 50 + 'px'
      })
    },
    confirm() {
      this.show = false
      this.$emit('confirm')
    }
  },

}
</script>
<style lang="scss" scoped>
$bg-color: rgb(226, 226, 226);

.pop-confirm-content {
  position: fixed;
  background: var(--color-tooltip-bg);
  padding: 15rem;
  border-radius: 4rem;
  transform: translate(-50%, calc(-100% - 10rem));
  box-shadow: 0 0 6px 1px var(--color-tooltip-shadow);
  z-index: 999;

  .text {
    color: var(--color-font-1);
    text-align: start;
    font-size: 14rem;
    width: 150rem;
    min-width: 150rem;
  }

  .options {
    margin-top: 15rem;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 12rem;
    font-size: 12rem;

    div {
      cursor: pointer;
    }

    .main {
      color: gray;
      background: $bg-color;
      padding: 3rem 10rem;
      border-radius: 4rem;
    }
  }
}
</style>
