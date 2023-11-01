<script setup lang="ts">

import VolumeIcon from "@/components/VolumeIcon.vue";
import {Icon} from "@iconify/vue";
import Modal from "@/components/Modal/Modal.vue";
import {$ref} from "vue/macros";
import {onMounted, onUnmounted} from "vue";
import {usePlayWordAudio} from "@/hooks/sound.ts";
import {emitter, EventKey} from "@/utils/eventBus.ts";
import ListItem from "@/components/ListItem.vue";

let show = $ref(false)
let list = $ref([])
let title = $ref('')
const playWordAudio = usePlayWordAudio()

onMounted(() => {
  emitter.on(EventKey.openWordListModal, (val: any) => {
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
          <ListItem
              class="common-list-item"
              :show-volume="true">
            <div class="item-title">
              <span class="word">{{ source.name }}</span>
              <span class="phonetic">{{ source.usphone }}</span>
              <VolumeIcon class="volume" @click="playWordAudio(source.name)"></VolumeIcon>
            </div>
            <div class="item-sub-title" v-if="source.trans.length">{{ source.trans.join('；') }}</div>
          </ListItem>
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
  margin-bottom: 15rem;
}

</style>
