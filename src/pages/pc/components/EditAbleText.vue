<script setup lang="ts">

import BaseButton from "@/components/BaseButton.vue";

import {watchEffect} from "vue";

interface IProps {
  value: string,
}

const props = withDefaults(defineProps<IProps>(), {
  value: '',
})

const emit = defineEmits([
  'save'
])

let editVal = $ref('')
let edit = $ref(false)

watchEffect(() => {
  editVal = props.value
})

function save() {
  emit('save', editVal)
  edit = false
}

function toggle() {
  edit = !edit
}
</script>

<template>
  <div
      v-if="edit"
      class="edit-text">
    <el-input
        v-model="editVal"
        ref="inputRef"
        autosize
        autofocus
        type="textarea"
        :input-style="`color: var(--color-font-1);font-size: 16rem;`"
    />
    <div class="options">
      <BaseButton @click="toggle">取消</BaseButton>
      <BaseButton @click="save">保存</BaseButton>
    </div>
  </div>
  <div
      v-else
      class="text"
      :style="`font-size: 16rem;`"
      @click="toggle">
    {{ value }}
  </div>
</template>

<style scoped lang="scss">
.edit-text {
  margin-top: 10rem;
  color: var(--color-font-1);

  .options {
    margin-top: 10rem;
    gap: 10rem;
    display: flex;
    justify-content: flex-end;
  }
}

.text {
  color: var(--color-font-1);
  min-height: 18rem;
}
</style>