<script setup lang="ts">
import { BaseIcon, Close, VolumeIcon } from '@/base'
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSettingStore } from '@/core/stores/setting.ts'
import { usePlayWordAudio } from '@/core/hooks/sound.ts'
import { closeWordLookup, wordLookupState } from '@/core/hooks/useWordLookup.ts'
import { openWordCollectPicker } from '@/core/hooks/useWordCollectPicker.ts'
import { getDefaultWord } from '@/core/types/func.ts'
import TranslationList from './TranslationList.vue'

const { t: $t } = useI18n()
const settingStore = useSettingStore()
const playWordAudio = usePlayWordAudio()
const popover = ref<HTMLElement | null>(null)
const dictionaryTabs = [
  { value: 'youdao', label: '有道词典' },
  { value: 'iciba', label: '金山词霸' },
] as const
const activeDictionary = ref<(typeof dictionaryTabs)[number]['value']>('youdao')
const dictionaryLabel = computed(() => dictionaryTabs.find(tab => tab.value === activeDictionary.value)!.label)
const dictionaryUrl = computed(() => {
  const word = encodeURIComponent(wordLookupState.queryWord)
  return activeDictionary.value === 'iciba'
    ? `https://www.iciba.com/word?w=${word}`
    : `https://dict.youdao.com/result?word=${word}&lang=en`
})

const isExternalLookup = computed(() => !wordLookupState.loading && wordLookupState.notFound)
const style = computed(() => ({
  left: isExternalLookup.value ? '50%' : `${wordLookupState.x}px`,
  top: isExternalLookup.value ? '50%' : `${wordLookupState.y}px`,
}))

const collectTarget = computed(() => {
  if (wordLookupState.data) return wordLookupState.data
  if (wordLookupState.queryWord) return getDefaultWord({ word: wordLookupState.queryWord })
  return null
})

function openCollect(e: MouseEvent) {
  e.stopPropagation()
  const target = collectTarget.value
  if (target) openWordCollectPicker(target, e.currentTarget as HTMLElement)
}

function onDocumentClick(e: MouseEvent) {
  const popover = document.querySelector('.word-lookup-popover')
  if (popover && !popover.contains(e.target as Node)) {
    closeWordLookup()
  }
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    closeWordLookup()
  }
}

function onDictionaryTabKeydown(e: KeyboardEvent) {
  const index = dictionaryTabs.findIndex(tab => tab.value === activeDictionary.value)
  let nextIndex: number
  switch (e.key) {
    case 'ArrowRight':
      nextIndex = (index + 1) % dictionaryTabs.length
      break
    case 'ArrowLeft':
      nextIndex = (index - 1 + dictionaryTabs.length) % dictionaryTabs.length
      break
    case 'Home':
      nextIndex = 0
      break
    case 'End':
      nextIndex = dictionaryTabs.length - 1
      break
    default:
      return
  }
  e.preventDefault()
  activeDictionary.value = dictionaryTabs[nextIndex].value
  const tabList = (e.currentTarget as HTMLElement).parentElement
  nextTick(() => tabList?.querySelectorAll<HTMLButtonElement>('[role="tab"]')[nextIndex]?.focus())
}

function updatePopoverPosition() {
  if (!wordLookupState.visible || !popover.value || isExternalLookup.value) return
  const el = popover.value
  const rect = el.getBoundingClientRect()
  const padding = 8
  const left = Math.max(padding, Math.min(wordLookupState.x - rect.width / 2, window.innerWidth - rect.width - padding))
  let top = wordLookupState.y
  if (top + rect.height > window.innerHeight - padding) {
    top = wordLookupState.y - rect.height - 16
  }
  top = Math.max(padding, Math.min(top, window.innerHeight - rect.height - padding))
  el.style.left = `${left}px`
  el.style.top = `${top}px`
}

onMounted(() => {
  document.addEventListener('click', onDocumentClick)
  document.addEventListener('keydown', onKeydown)
  window.addEventListener('resize', updatePopoverPosition)
})

onUnmounted(() => {
  document.removeEventListener('click', onDocumentClick)
  document.removeEventListener('keydown', onKeydown)
  window.removeEventListener('resize', updatePopoverPosition)
})

watch(
  () => [wordLookupState.visible, wordLookupState.loading, wordLookupState.queryWord],
  () => {
    activeDictionary.value = 'youdao'
  }
)

watch(
  () => [
    wordLookupState.visible,
    wordLookupState.x,
    wordLookupState.y,
    wordLookupState.loading,
    wordLookupState.notFound,
  ],
  () => {
    if (!wordLookupState.visible) return
    nextTick(updatePopoverPosition)
  }
)
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="wordLookupState.visible"
        ref="popover"
        class="word-lookup-popover"
        :class="{ 'word-lookup-popover--external': isExternalLookup }"
        :style="style"
        @click.stop
      >
        <Close class="close-btn" :title="$t('close')" @click="closeWordLookup" />

        <template v-if="wordLookupState.loading">
          <div class="text-sm color-gray py-2 pr-5">查询中...</div>
        </template>
        <template v-else-if="wordLookupState.notFound">
          <div class="flex items-center gap-2 flex-wrap pr-5">
            <span class="text-lg font-medium">{{ wordLookupState.queryWord }}</span>
            <VolumeIcon :simple="true" :cb="() => playWordAudio(wordLookupState.queryWord)" />
            <BaseIcon v-if="collectTarget" @click="openCollect" :title="$t('collect_to_dict')">
              <IconFluentStarAdd16Regular />
            </BaseIcon>
          </div>
          <div class="mt-1 mb-3 flex items-center gap-3 flex-wrap text-sm">
            <span class="color-gray">暂未收录</span>
            <div role="tablist" aria-label="查词词典" class="dictionary-tabs ml-auto">
              <button
                v-for="tab in dictionaryTabs"
                :id="`word-lookup-tab-${tab.value}`"
                :key="tab.value"
                type="button"
                role="tab"
                :aria-selected="activeDictionary === tab.value"
                aria-controls="word-lookup-dictionary-panel"
                :tabindex="activeDictionary === tab.value ? 0 : -1"
                class="dictionary-tab"
                @click="activeDictionary = tab.value"
                @keydown="onDictionaryTabKeydown"
              >
                {{ tab.label }}
              </button>
            </div>
            <a :href="dictionaryUrl" target="_blank" rel="noopener noreferrer" class="text-link">在新窗口打开</a>
          </div>
          <div
            id="word-lookup-dictionary-panel"
            role="tabpanel"
            :aria-labelledby="`word-lookup-tab-${activeDictionary}`"
          >
            <iframe
              :key="dictionaryUrl"
              :src="dictionaryUrl"
              :title="`${dictionaryLabel}：${wordLookupState.queryWord}`"
              class="dictionary-frame"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
              referrerpolicy="no-referrer"
            />
          </div>
        </template>
        <template v-else-if="wordLookupState.data">
          <div class="flex items-center gap-1 flex-wrap pr-7">
            <span class="text-lg font-medium">{{ wordLookupState.data.word }}</span>
            <span v-if="settingStore.soundType === 'uk' && wordLookupState.data.phonetic0" class="text-sm color-gray">
              /{{ wordLookupState.data.phonetic0 }}/
            </span>
            <span v-if="settingStore.soundType === 'us' && wordLookupState.data.phonetic1" class="text-sm color-gray">
              /{{ wordLookupState.data.phonetic1 }}/
            </span>
            <VolumeIcon :cb="() => playWordAudio(wordLookupState.data!.word)" />
            <BaseIcon @click="openCollect" :title="$t('collect_to_dict')">
              <IconFluentStarAdd16Regular />
            </BaseIcon>
          </div>
          <TranslationList
            v-if="wordLookupState.data.trans?.length"
            class="mt-2"
            :word="wordLookupState.data"
            :show-full="true"
            :pos-space="false"
          />
        </template>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped lang="scss">
.word-lookup-popover {
  position: fixed;
  z-index: 10000;
  box-sizing: border-box;
  width: max-content;
  max-width: min(22rem, calc(100vw - 16px));
  min-width: min(15rem, calc(100vw - 16px));
  max-height: calc(100dvh - 16px);
  overflow: auto;
  background: var(--color-tooltip-bg);
  border: 1px solid var(--color-item-border);
  border-radius: 0.5rem;
  padding: 0.75rem 1rem;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  pointer-events: auto;
}

.word-lookup-popover--external {
  transform: translate(-50%, -50%);
  width: min(64rem, calc(100vw - 16px));
  max-width: min(64rem, calc(100vw - 16px));
}

.dictionary-tabs {
  display: flex;
  gap: 0.25rem;
  padding: 0.25rem;
  border: 1px solid var(--color-item-border);
  border-radius: 0.5rem;
}

.dictionary-tab {
  padding: 0.25rem 0.75rem;
  border: 0;
  border-radius: 0.25rem;
  background: transparent;
  color: inherit;
  cursor: pointer;

  &[aria-selected='true'] {
    background: var(--color-item-border);
    color: var(--color-main-text);
  }

  &:focus-visible {
    outline: 2px solid currentColor;
    outline-offset: 2px;
  }
}

.dictionary-frame {
  display: block;
  width: 100%;
  height: min(32rem, calc(100dvh - 10rem));
  border: 0;
  border-radius: 0.25rem;
  background: #fff;
}

.close-btn {
  position: absolute;
  top: 1.1rem;
  right: 1rem;
  z-index: 1;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
