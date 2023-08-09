<template>
  <div class="pop-confirm">
    <Teleport to="body">
      <Transition>
        <div ref="tip" class="pop-confirm-content" v-if="show">
          <div class="text">
            {{ title }}
          </div>
          <div class="options">
            <div @click="show = false">取消</div>
            <div class="main" @click="confirm">确认</div>
          </div>
        </div>
      </Transition>
    </Teleport>
    <span @click="showPop">
      <slot></slot>
    </span>
  </div>
</template>
<script>
import {nextTick} from "vue";

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
  methods: {
    showPop(e) {
      if (this.disabled) return
      let rect = e.target.getBoundingClientRect()
      this.show = true
      nextTick(() => {
        this.$refs.tip.style.top = rect.top + 'px'
        this.$refs.tip.style.left = rect.left + rect.width / 2 - 50 + 'px'
      })
    },
    confirm() {
      this.show = false
      this.$emit('confirm')
    }
  }
}
</script>
<style lang="scss" scoped>
$bg-color: rgb(226, 226, 226);

.pop-confirm-content {
  position: fixed;
  background: white;
  padding: 15rem;
  box-shadow: 0 0 12px rgba(0, 0, 0, .2);
  border-radius: 4rem;
  transform: translate(-50%, calc(-100% - 10rem));
  z-index: 999;

  .text {
    color: black;
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
    gap: 10rem;
    font-size: 10rem;

    div {
      cursor: pointer;
    }

    .main {
      color: gray;
      background: $bg-color;
      padding: 3rem 8rem;
      border-radius: 2rem;
    }
  }
}
</style>
 