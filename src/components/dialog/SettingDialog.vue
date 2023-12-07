<script setup lang="ts">
import Dialog from "@/components/dialog/Dialog.vue"
import {Icon} from '@iconify/vue';
import {ref} from "vue";
import {useSettingStore} from "@/stores/setting.ts";
import {getAudioFileUrl, useChangeAllSound, usePlayAudio, useWatchAllSound} from "@/hooks/sound.ts";
import {getShortcutKey, useDisableEventListener, useEventListener} from "@/hooks/event.ts";
import {$computed, $ref} from "vue/macros";
import {cloneDeep} from "lodash-es";
import {DefaultShortcutKeyMap, ShortcutKey} from "@/types.ts";
import BaseButton from "@/components/BaseButton.vue";
import {SoundFileOptions} from "@/utils/const.ts";
import VolumeIcon from "@/components/icon/VolumeIcon.vue";
import Setting from "@/components/Setting.vue";
import {useRuntimeStore} from "@/stores/runtime.ts";

const runtimeStore = useRuntimeStore()
let disabledDialogEscKey = $ref(false)
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
@import "@/assets/css/variable";

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
      padding: 10rem 20rem;
      display: flex;
      flex-direction: column;
      //align-items: center;
      //justify-content: center;
      gap: 10rem;

      .tab {
        cursor: pointer;
        padding: 10rem 15rem;
        border-radius: 8rem;
        display: flex;
        align-items: center;
        gap: 10rem;

        &.active {
          background: var(--color-item-bg);
        }
      }
    }

    .git-log {
      font-size: 10rem;
      color: gray;
      margin-bottom: 5rem;
    }
  }

  .content {
    background: var(--color-header-bg);
    flex: 1;
    height: 100%;
    overflow: auto;
    padding: 0 var(--space);

    .row {
      height: 40rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: calc(var(--space) * 5);

      .wrapper {
        height: 30rem;
        flex: 1;
        display: flex;
        justify-content: flex-end;
        gap: var(--space);

        span {
          text-align: right;
          //width: 30rem;
          font-size: 12rem;
          color: gray;
        }

        .set-key {
          align-items: center;

          input {
            width: 150rem;
            box-sizing: border-box;
            margin-right: 10rem;
            height: 28rem;
            outline: none;
            font-size: 16rem;
            border: 1px solid gray;
            border-radius: 3rem;
            padding: 0 5rem;
            background: var(--color-second-bg);
            color: var(--color-font-1);
          }
        }


      }

      .main-title {
        font-size: 18rem;
        font-weight: bold;
      }

      .item-title {
        font-size: 16rem;
      }

      .sub-title {
        font-size: 14rem;
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
      padding-right: 10rem;
      overflow: auto;
    }

    .footer {
      margin-bottom: 20rem;
    }

    .desc {
      margin-bottom: 10rem;
      font-size: 12rem;
    }

    .line {
      border-bottom: 1px solid #c4c3c3;
    }
  }
}

</style>