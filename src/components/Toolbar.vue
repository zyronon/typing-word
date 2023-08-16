<script setup lang="ts">
import Tooltip from "@/components/Tooltip.vue"
import {
  MenuFold,
  Moon,
  PreviewCloseOne,
  PreviewOpen,
  SettingTwo,
  SunOne,
  VolumeNotice,
  HeadphoneSound,
  SettingConfig
} from "@icon-park/vue-next"
import IconRepeat from '~icons/tabler/repeat'
import useThemeColor from "@/hooks/useThemeColor.ts"
import {useBaseStore} from "@/stores/base.ts"
import {reactive} from "vue"
import Modal from "@/components/Modal.vue"

const {appearance, toggle} = useThemeColor()
const store = useBaseStore()
const setting = reactive({
  show: true
})
</script>

<template>
  <header>
    <div class="info">

    </div>
    <div class="options">
      <Tooltip title="切换主题">
        <moon v-if="appearance === 'dark'" theme="filled" size="20" fill="#0C8CE9" :strokeWidth="2"
              @click="toggle"/>
        <sun-one v-else theme="filled" size="20" fill="#0C8CE9" :strokeWidth="2" @click="toggle"/>
      </Tooltip>
      <Tooltip title="设置">
        <setting-two @click="setting.show = true" theme="filled" size="20" fill="#0C8CE9" :strokeWidth="2"/>
      </Tooltip>
      <Tooltip title="音效设置">
        <volume-notice theme="filled" size="20" fill="#0C8CE9" :strokeWidth="2"/>
      </Tooltip>

      <IconRepeat></IconRepeat>

      <Tooltip title="单词本">
        <preview-open theme="filled" size="20" fill="#0C8CE9" :strokeWidth="2"/>
        <preview-close-one theme="filled" size="20" fill="#0C8CE9" :strokeWidth="2"/>
      </Tooltip>
      <div class="my-button" @click="store.dictModalIsOpen = true">ok</div>
      <div class="my-button" @click="store.dictModalIsOpen2 = true">ok</div>
      <Tooltip title="单词本">
        <menu-fold class="menu" @click="store.sideIsOpen = !store.sideIsOpen"
                   theme="outline" size="20" fill="#929596"
                   :strokeWidth="2"/>
      </Tooltip>
    </div>
  </header>
  <Modal v-model="setting.show" title="title">
    <div class="setting-modal">
      <div class="tabs">
        <div class="tab">
          <headphone-sound theme="filled" size="20" fill="#0C8CE9" :strokeWidth="2"/>
          <span>音效设置</span>
        </div>
        <div class="tab">
          <setting-config theme="filled" size="20" fill="#0C8CE9" :strokeWidth="2"/>
          <span>其他设置</span>
        </div>
      </div>
      <div class="content">

      </div>
    </div>
  </Modal>
</template>

<style scoped lang="scss">
@import "@/assets/css/colors.scss";

header {
  margin-top: 10rem;
  height: 60rem;
  width: 50%;
  background: var(--color-header-bg);
  display: flex;
  justify-content: space-between;
  border-radius: 8rem;
  position: relative;
  z-index: 2;
  padding: 10rem $space;
  box-sizing: border-box;

  .options {
    display: flex;
    align-items: center;
    gap: 10rem;
  }
}

.setting-modal {
  width: 40vw;
  height: 50vh;
  display: flex;
  color: var(--color-font);

  .tabs {
    padding: 10rem 20rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    //justify-content: center;
    gap: 10rem;

    .tab {
      padding: 10rem 15rem;
      background: whitesmoke;
      border-radius: 8rem;
    }
  }

  .content {
    background: white;
    flex: 1;
    height: 100%;
  }
}


</style>