<script setup lang="ts">
import Dialog from "@/pages/pc/components/dialog/Dialog.vue"
import Setting from "@/pages/pc/components/Setting.vue";
import {useRuntimeStore} from "@/stores/runtime.ts";

const runtimeStore = useRuntimeStore()
let disabledDialogEscKey = $ref(true)
</script>

<template>
  <Dialog
      v-model="runtimeStore.showSettingModal"
      :keyboard="disabledDialogEscKey"
      title="设置">
    <Setting @toggle-disabled-dialog-esc-key="e => disabledDialogEscKey = !e"/>
  </Dialog>
</template>

<style scoped lang="scss">
@import "@/assets/css/style";

.setting-modal {
  width: 40vw;
  height: 70vh;
  display: flex;
  color: var(--color-font-1);

  .left {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;

    .tabs {
      padding: .6rem 1.6rem;
      display: flex;
      flex-direction: column;
      //align-items: center;
      //justify-content: center;
      gap: .6rem;

      .tab {
        cursor: pointer;
        padding: .6rem .9rem;
        border-radius: .5rem;
        display: flex;
        align-items: center;
        gap: .6rem;

        &.active {
          background: var(--color-item-bg);
        }
      }
    }

    .git-log {
      font-size: .6rem;
      color: gray;
      margin-bottom: .3rem;
    }
  }

  .content {
    background: var(--color-header-bg);
    flex: 1;
    height: 100%;
    overflow: auto;
    padding: 0 var(--space);

    .row {
      height: 2.6rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: calc(var(--space) * 5);

      .wrapper {
        height: 2rem;
        flex: 1;
        display: flex;
        justify-content: flex-end;
        gap: var(--space);

        span {
          text-align: right;
          //width: 30rem;
          font-size: .7rem;
          color: gray;
        }

        .set-key {
          align-items: center;

          input {
            width: 9rem;
            box-sizing: border-box;
            margin-right: .6rem;
            height: 1.8rem;
            outline: none;
            font-size: 1rem;
            border: 1px solid gray;
            border-radius: .2rem;
            padding: 0 .3rem;
            background: var(--color-second-bg);
            color: var(--color-font-1);
          }
        }


      }

      .main-title {
        font-size: 1.1rem;
        font-weight: bold;
      }

      .item-title {
        font-size: 1rem;
      }

      .sub-title {
        font-size: .9rem;
      }
    }

    .body {
      height: 100%;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    .scroll {
      flex: 1;
      padding-right: .6rem;
      overflow: auto;
    }

    .footer {
      margin-bottom: 1.3rem;
    }

    .desc {
      margin-bottom: .6rem;
      font-size: .8rem;
    }

    .line {
      border-bottom: 1px solid #c4c3c3;
    }
  }
}

</style>