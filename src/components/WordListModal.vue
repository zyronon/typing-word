<script setup lang="ts">

import VolumeIcon from "@/components/VolumeIcon.vue";
import {Icon} from "@iconify/vue";
import Modal from "@/components/Modal/Modal.vue";
import {$ref} from "vue/macros";
import {onMounted, onUnmounted} from "vue";
import {usePlayWordAudio} from "@/hooks/sound.ts";
import {emitter, EventKey} from "@/utils/eventBus.ts";
import WordItem from "@/components/WordItem.vue";

let show = $ref(false)
let list = $ref([])
let title = $ref('')
const playWordAudio = usePlayWordAudio()

onMounted(() => {
  emitter.on(EventKey.openWordListModal, (val) => {
    list = val.list
    title = val.title
    show = true
  })
})

onUnmounted(() => {
  emitter.off(EventKey.openWordListModal)
})
</script>

<template>
  <Modal
      :title="title"
      v-model="show">
    <div class="all-word">
      <virtual-list class="virtual-list"
                    :keeps="20"
                    data-key="name"
                    :data-sources="list"
                    :estimate-size="85"
                    item-class="dict-virtual-item"
      >
        <template #={source}>
          <div class="left">
            <div class="title">
              <span class="word">{{ source.name }}</span>
              <span class="phonetic">{{ source.usphone }}</span>
            </div>
            <div class="translate">{{ source.trans.join('；') }}</div>
          </div>
          <div class="right">
            <VolumeIcon @click="playWordAudio(source.name)"></VolumeIcon>
            <Icon icon="fluent:delete-28-regular" width="20" color="#929596"/>
          </div>
<!--          <WordItem-->
<!--              :word="source"/>-->
        </template>
      </virtual-list>
    </div>
  </Modal>
</template>

<style lang="scss" scoped>
@import "@/assets/css/style";

.all-word {
  padding: $space;
  padding-top: 0;
  width: 400rem;
  height: 75vh;
}
</style>

<style lang="scss">
@import "@/assets/css/variable.scss";

.virtual-list {
  overflow: auto;
  height: 100%;
}

.dict-virtual-item {
  background: var(--color-header-bg);
  border-radius: 6rem;
  padding: 8rem 12rem;
  display: flex;
  justify-content: space-between;
  transition: all .3s;
  color: var(--color-font-1);
  margin-bottom: 10rem;

  &.active {
    background: $second;
    color: white;
  }

  &:hover {
    //background: $dark-main-bg;
    //background: $item-hover;
    background: rgb(226, 226, 226);
  }

  .left {
    .title {
      display: flex;
      align-items: center;
      gap: 10rem;

      .word {
        font-size: 24rem;
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace;
        display: flex;
      }

      .phonetic {
        font-size: 14rem;
        color: gray;
      }
    }

    .translate {
      font-size: 14rem;
    }
  }

  .right {
    display: flex;
    align-items: center;
    flex-direction: column;
    gap: 5rem;
  }
}

</style>
