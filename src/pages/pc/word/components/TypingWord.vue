<script setup lang="ts">
import {provide, watch} from "vue"
import {useBaseStore} from "@/stores/base.ts"
import {getDefaultWord, ShortcutKey, StudyData, Word} from "@/types.ts";
import {emitter, EventKey, useEvents} from "@/utils/eventBus.ts"
import {cloneDeep, shuffle} from "lodash-es"
import {usePracticeStore} from "@/stores/practice.ts"
import {useSettingStore} from "@/stores/setting.ts";
import {useOnKeyboardEventListener} from "@/hooks/event.ts";
import {Icon} from "@iconify/vue";
import Tooltip from "@/pages/pc/components/Tooltip.vue";
import Typing from "@/pages/pc/components/Typing.vue";
import Panel from "@/pages/pc/components/Panel.vue";
import {useWordOptions} from "@/hooks/dict.ts";
import BaseIcon from "@/components/BaseIcon.vue";
import WordList from "@/pages/pc/components/list/WordList.vue";
import Empty from "@/components/Empty.vue";
import Footer from "@/pages/pc/word/Footer.vue";

interface IProps {
  data: {
    new: any[],
    review: any[],
    write: any[],
  }
}

const props = withDefaults(defineProps<IProps>(), {
  data: {
    new: [],
    review: [],
    write: [],
  }
})

const emit = defineEmits<{
  'update:words': [val: Word[]],
  sort: [val: Word[]],
  complete: [val: any]
}>()

const typingRef: any = $ref()
const store = useBaseStore()
const statStore = usePracticeStore()
const settingStore = useSettingStore()

const {
  isWordCollect,
  toggleWordCollect,
  isWordSimple,
  toggleWordSimple
} = useWordOptions()

let allWrongWords = []

let data = $ref<StudyData>({
  index: 0,
  words: [],
  wrongWords: [],
})

provide('studyData', data)

watch(() => props.data, () => {
  data.words = props.data.new
  data.index = 0
  data.wrongWords = []
  allWrongWords = []

  statStore.step = 0
  statStore.startDate = Date.now()
  statStore.inputWordNumber = 0
  statStore.wrong = 0
  statStore.total = props.data.review.concat(props.data.new).concat(props.data.write).length
  statStore.newWordNumber = props.data.new.length
  statStore.index = 0
}, {immediate: true, deep: true})

const word = $computed(() => {
  return data.words[data.index] ?? getDefaultWord()
})

const prevWord: Word = $computed(() => {
  return data.words?.[data.index - 1] ?? undefined
})

const nextWord: Word = $computed(() => {
  return data.words?.[data.index + 1] ?? undefined
})

function next(isTyping: boolean = true) {
  if (data.index === data.words.length - 1) {
    if (data.wrongWords.length) {
      console.log('学完了，但还有错词')
      data.words = shuffle(cloneDeep(data.wrongWords))
      data.index = 0
      data.wrongWords = []
    } else {
      console.log('学完了，没错词', statStore.total, statStore.step, data.index)
      isTyping && statStore.inputWordNumber++
      statStore.speed = Date.now() - statStore.startDate

      if (statStore.step === 2) {
        console.log('emit')
        emitter.emit(EventKey.openStatModal, {})
        // emit('complete', {})
      }

      if (statStore.step === 1) {
        settingStore.dictation = true
        data.words = shuffle(props.data.write.concat(props.data.new).concat(props.data.review))
        statStore.step++
        data.index = 0
      }

      if (statStore.step === 0) {
        statStore.step++
        if (props.data.review.length) {
          data.words = shuffle(props.data.review)
          settingStore.dictation = false
          data.index = 0
        } else {
          next()
        }
      }
    }
  } else {
    data.index++
    isTyping && statStore.inputWordNumber++
    // console.log('这个词完了')
  }
}

function wordWrong() {
  if (!store.wrong.words.find((v: Word) => v.word.toLowerCase() === word.word.toLowerCase())) {
    store.wrong.words.push(word)
  }
  if (!data.wrongWords.find((v: Word) => v.word.toLowerCase() === word.word.toLowerCase())) {
    data.wrongWords.push(word)
  }
  if (!allWrongWords.find((v: Word) => v.word.toLowerCase() === word.word.toLowerCase())) {
    allWrongWords.push(word)
    statStore.wrong++
  }
}

function onKeyUp(e: KeyboardEvent) {
  typingRef.hideWord()
}

async function onKeyDown(e: KeyboardEvent) {
  // console.log('e', e)
  switch (e.key) {
    case 'Backspace':
      typingRef.del()
      break
  }
}

useOnKeyboardEventListener(onKeyDown, onKeyUp)

//TODO 略过忽略的单词上
function prev() {
  if (data.index === 0) {
    ElMessage.warning('已经是第一个了~')
  } else {
    data.index--
  }
}

function skip(e: KeyboardEvent) {
  next(false)
  // e.preventDefault()
}

function show(e: KeyboardEvent) {
  typingRef.showWord()
}

function collect(e: KeyboardEvent) {
  toggleWordCollect(word)
}

function toggleWordSimpleWrapper() {
  if (!isWordSimple(word)) {
    toggleWordSimple(word)
    //延迟一下，不知道为什么不延迟会导致当前条目不自动定位到列表中间
    setTimeout(() => next(false))
  } else {
    toggleWordSimple(word)
  }
}

function play() {
  typingRef.play()
}

useEvents([
  [ShortcutKey.ShowWord, show],
  [ShortcutKey.Previous, prev],
  [ShortcutKey.Next, skip],
  [ShortcutKey.ToggleCollect, collect],
  [ShortcutKey.ToggleSimple, toggleWordSimpleWrapper],
  [ShortcutKey.PlayWordPronunciation, play],
])

</script>

<template>
  <div class="practice-wrapper">
    <div class="practice-word">
      <div class="absolute z-1 top-4   w-full" v-if="settingStore.showNearWord">
        <div class="center gap-2 cursor-pointer float-left"
             @click="prev"
             v-if="prevWord">
          <Icon class="arrow" icon="bi:arrow-left" width="22"/>
          <Tooltip
              :title="`上一个(${settingStore.shortcutKeyMap[ShortcutKey.Previous]})`"
          >
            <div class="word">{{ prevWord.word }}</div>
          </Tooltip>
        </div>
        <div class="center gap-2 cursor-pointer float-right "
             @click="next(false)"
             v-if="nextWord">
          <Tooltip
              :title="`下一个(${settingStore.shortcutKeyMap[ShortcutKey.Next]})`"
          >
            <div class="word" :class="settingStore.dictation && 'word-shadow'">{{ nextWord.word }}</div>
          </Tooltip>
          <Icon class="arrow" icon="bi:arrow-right" width="22"/>
        </div>
      </div>
      <Typing
          v-loading="!store.load"
          ref="typingRef"
          :word="word"
          @wrong="wordWrong"
          @complete="next"
      />
    </div>

    <Footer
        :is-simple="isWordSimple(word)"
        @toggle-simple="toggleWordSimpleWrapper"
        :is-collect="isWordCollect(word)"
        @toggle-collect="toggleWordCollect(word)"
        @skip="next(false)"
    />
    <div class="word-panel-wrapper">
      <Panel>
        <template v-slot="{active}">
          <div class="panel-page-item pl-4"
               v-loading="!store.load"
          >
            <WordList
                v-if="data.words.length"
                :is-active="active"
                :static="false"
                :show-word="!settingStore.dictation"
                :show-translate="settingStore.translate"
                :list="data.words"
                :activeIndex="data.index"
                @click="(val:any) => data.index = val.index"
            >
              <template v-slot:suffix="{item,index}">
                <BaseIcon
                    v-if="!isWordCollect(item)"
                    class="collect"
                    @click="toggleWordCollect(item)"
                    title="收藏" icon="ph:star"/>
                <BaseIcon
                    v-else
                    class="fill"
                    @click="toggleWordCollect(item)"
                    title="取消收藏" icon="ph:star-fill"/>
                <BaseIcon
                    v-if="!isWordSimple(item)"
                    class="easy"
                    @click="toggleWordSimple(item)"
                    title="标记为已掌握"
                    icon="material-symbols:check-circle-outline-rounded"/>
                <BaseIcon
                    v-else
                    class="fill"
                    @click="toggleWordSimple(item)"
                    title="取消标记已掌握"
                    icon="material-symbols:check-circle-rounded"/>
              </template>
            </WordList>
            <Empty v-else/>
          </div>
        </template>
      </Panel>
    </div>
  </div>
</template>

<style scoped lang="scss">

.practice-wrapper {
  width: 100%;
  height: 100vh;
  display: flex;
  overflow: hidden;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  position: relative;
}

.practice-word {
  overflow: auto;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: .4rem;
  position: relative;
  width: var(--toolbar-width);
}

.word-panel-wrapper {
  position: absolute;
  left: var(--panel-margin-left);
  top: .8rem;
  z-index: 1;
  height: calc(100% - 1.5rem);
}

</style>
