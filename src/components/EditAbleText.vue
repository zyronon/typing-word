<script setup lang="ts">

import BaseButton from "@/components/BaseButton.vue";
import {$ref} from "vue/macros";
import {watchEffect} from "vue";

interface IProps {
  value?: string,
  fontSize?: string,
}

const props = withDefaults(defineProps<IProps>(), {
  value: '',
  fontSize: '16rem'
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
</script>

<template>
  <div class="edit-text" v-if="edit">
    <el-input
        v-model="editVal"
        autosize
        type="textarea"
        :input-style="`color:black;font-size: ${fontSize};`"
    />
    <div class="options">
      <BaseButton @click="edit = false">取消</BaseButton>
      <BaseButton @click="save">保存</BaseButton>
    </div>
  </div>
  <div class="text"
       :style="`font-size: ${fontSize};`"
       v-else @click="edit = true">
    {{ value }}
  </div>
</template>

<style scoped lang="scss">
.edit-text {
  margin-top: 10rem;
  color: black;

  .options {
    margin-top: 10rem;
    gap: 10rem;
    display: flex;
    justify-content: flex-end;
  }
}

.text {
  min-height: 18rem;
}
</style>