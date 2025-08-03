<script setup lang="ts">
import {computed} from 'vue'

interface IProps {
  text: string
  dictation: boolean
  highLight?: boolean
  word: string
}

const props = withDefaults(defineProps<IProps>(), {
  text: '',
  dictation: false,
  highLight: true,
  word: ''
})

// 计算属性：将句子中的目标单词高亮显示
const highlightedText = computed(() => {
  if (!props.text || !props.word) {
    return props.text
  }

  // 创建正则表达式，不区分大小写，匹配整个单词
  const regex = new RegExp(`\\b${escapeRegExp(props.word)}\\b`, 'gi')

  // 将匹配的单词用span标签包裹
  return props.text.replace(regex, (match) => {
    return `<span class="${props.highLight && 'highlight-word'} ${props.dictation && 'word-shadow'}">${match}</span>`
  })
})

// 转义正则表达式特殊字符
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
</script>

<template>
  <div v-html="highlightedText"></div>
</template>

<style scoped lang="scss">
:deep(.highlight-word) {
  color: var(--color-icon-hightlight);
}
</style>
