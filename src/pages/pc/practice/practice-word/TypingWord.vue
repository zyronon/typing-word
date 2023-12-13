<script setup lang="ts">
import {onMounted, onUnmounted, watch} from "vue"
import {$computed, $ref} from "vue/macros"
import {useBaseStore} from "@/stores/base.ts"
import {DefaultDisplayStatistics, DictType, ShortcutKey, Sort, Word} from "../../../../types.ts";
import {emitter, EventKey} from "@/utils/eventBus.ts"
import {cloneDeep, reverse, shuffle} from "lodash-es"
import {usePracticeStore} from "@/stores/practice.ts"
import {useSettingStore} from "@/stores/setting.ts";
import {useOnKeyboardEventListener, useWindowClick} from "@/hooks/event.ts";
import {Icon} from "@iconify/vue";
import Tooltip from "@/components/Tooltip.vue";
import Options from "@/pages/pc/practice/Options.vue";
import Typing from "@/pages/pc/practice/practice-word/Typing.vue";
import Panel from "@/pages/pc/practice/Panel.vue";
import IconWrapper from "@/components/IconWrapper.vue";
import {useRuntimeStore} from "@/stores/runtime.ts";
import {syncMyDictList, useWordOptions} from "@/hooks/dict.ts";
import BaseIcon from "@/components/BaseIcon.vue";
import WordList from "@/components/list/WordList.vue";
import Empty from "@/components/Empty.vue";
import MiniDialog from "@/components/dialog/MiniDialog.vue";
import BaseButton from "@/components/BaseButton.vue";

interface IProps {
  words: Word[],
  index: number,
}

const props = withDefaults(defineProps<IProps>(), {
  words: [],
  index: -1
})

const emit = defineEmits<{
  'update:words': [val: Word[]],
  sort: [val: Word[]]
}>()

const typingRef: any = $ref()
const store = useBaseStore()
const runtimeStore = useRuntimeStore()
const practiceStore = usePracticeStore()
const settingStore = useSettingStore()

const {
  isWordCollect,
  toggleWordCollect,
  isWordSimple,
  toggleWordSimple
} = useWordOptions()

let data = $ref({
  index: props.index,
  words: props.words,
  wrongWords: [],
})

let stat = cloneDeep(DefaultDisplayStatistics)
let showSortOption = $ref(false)
useWindowClick(() => showSortOption = false)

watch(() => props.words, () => {
  data.words = props.words
  data.index = props.index
  data.wrongWords = []

  practiceStore.wrongWords = []
  practiceStore.repeatNumber = 0
  practiceStore.startDate = Date.now()
  practiceStore.correctRate = -1
  practiceStore.inputWordNumber = 0
  practiceStore.wrongWordNumber = 0
  stat = cloneDeep(DefaultDisplayStatistics)

}, {immediate: true})

watch(data, () => {
  practiceStore.total = data.words.length
  practiceStore.index = data.index
})

const word = $computed(() => {
  return data.words[data.index] ?? {
    trans: [],
    word: '',
    usphone: '',
    ukphone: '',
  }
})

const prevWord: Word = $computed(() => {
  return data.words?.[data.index - 1] ?? undefined
})

const nextWord: Word = $computed(() => {
  return data.words?.[data.index + 1] ?? undefined
})

function next(isTyping: boolean = true) {
  if (data.index === data.words.length - 1) {

    //复制当前错词，因为第一遍错词是最多的，后续的练习都是从错词中练习
    if (stat.total === -1) {
      let now = Date.now()
      stat = {
        startDate: practiceStore.startDate,
        endDate: now,
        spend: now - practiceStore.startDate,
        total: props.words.length,
        correctRate: -1,
        inputWordNumber: practiceStore.inputWordNumber,
        wrongWordNumber: data.wrongWords.length,
        wrongWords: data.wrongWords,
      }
      stat.correctRate = 100 - Math.trunc(((stat.wrongWordNumber) / (stat.total)) * 100)
    }

    if (data.wrongWords.length) {
      console.log('当前背完了，但还有错词')
      data.words = cloneDeep(data.wrongWords)

      practiceStore.total = data.words.length
      practiceStore.index = data.index = 0
      practiceStore.inputWordNumber = 0
      practiceStore.wrongWordNumber = 0
      practiceStore.repeatNumber++
      data.wrongWords = []
    } else {
      console.log('这章节完了')
      isTyping && practiceStore.inputWordNumber++

      let now = Date.now()
      stat.endDate = now
      stat.spend = now - stat.startDate

      emitter.emit(EventKey.openStatModal, stat)
    }
  } else {
    data.index++
    isTyping && practiceStore.inputWordNumber++
    console.log('这个词完了')
    if ([DictType.word].includes(store.currentDict.type)
        && store.skipWordNames.includes(word.word.toLowerCase())) {
      next()
    }
  }
}

function wordWrong() {
  if (!store.wrong.originWords.find((v: Word) => v.word.toLowerCase() === word.word.toLowerCase())) {
    store.wrong.originWords.push(word)
  }
  if (!data.wrongWords.find((v: Word) => v.word.toLowerCase() === word.word.toLowerCase())) {
    data.wrongWords.push(word)
    practiceStore.wrongWordNumber++
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

function sort(type: Sort) {
  if (type === Sort.reverse) {
    ElMessage.success('已翻转排序')
    emit('sort', reverse(cloneDeep(data.words)))
  }
  if (type === Sort.random) {
    ElMessage.success('已随机排序')
    emit('sort', shuffle(data.words))
  }
}

onMounted(() => {
  emitter.on(ShortcutKey.ShowWord, show)
  emitter.on(ShortcutKey.Previous, prev)
  emitter.on(ShortcutKey.Next, skip)
  emitter.on(ShortcutKey.ToggleCollect, collect)
  emitter.on(ShortcutKey.ToggleSimple, toggleWordSimpleWrapper)
  emitter.on(ShortcutKey.PlayWordPronunciation, play)
})

onUnmounted(() => {
  emitter.off(ShortcutKey.ShowWord, show)
  emitter.off(ShortcutKey.Previous, prev)
  emitter.off(ShortcutKey.Next, skip)
  emitter.off(ShortcutKey.ToggleCollect, collect)
  emitter.off(ShortcutKey.ToggleSimple, toggleWordSimpleWrapper)
  emitter.off(ShortcutKey.PlayWordPronunciation, play)
})

</script>

<template>
  <div class="practice-word">
    <div class="near-word" v-if="settingStore.showNearWord">
      <div class="prev"
           @click="prev"
           v-if="prevWord">
        <Icon class="arrow" icon="bi:arrow-left" width="22"/>
        <Tooltip
            :title="`上一个(快捷键：${settingStore.shortcutKeyMap[ShortcutKey.Previous]})`"
        >
          <div class="word">{{ prevWord.word }}</div>
        </Tooltip>
      </div>
      <div class="next"
           @click="next(false)"
           v-if="nextWord">
        <Tooltip
            :title="`下一个(快捷键：${settingStore.shortcutKeyMap[ShortcutKey.Next]})`"
        >
          <div class="word" :class="settingStore.dictation && 'text-shadow'">{{ nextWord.word }}</div>
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
    <div class="options-wrapper">
      <Options
          :is-simple="isWordSimple(word)"
          @toggle-simple="toggleWordSimpleWrapper"
          :is-collect="isWordCollect(word)"
          @toggle-collect="toggleWordCollect(word)"
          @skip="next(false)"
      />
    </div>

    <Teleport to="body">
      <div class="word-panel-wrapper">
        <Panel>
          <template v-slot="{active}">
            <div class="panel-page-item"
                 v-loading="!store.load"
            >
              <div class="list-header">
                <div class="left">
                  <div class="title">
                    {{ store.chapterName }}
                  </div>
                  <BaseIcon title="切换词典"
                            @click="emitter.emit(EventKey.openDictModal,'list')"
                            icon="carbon:change-catalog"/>
                  <div style="position:relative;"
                       @click.stop="null">
                    <BaseIcon
                        title="改变顺序"
                        icon="icon-park-outline:sort-two"
                        @click="showSortOption = !showSortOption"
                    />
                    <MiniDialog
                        v-model="showSortOption"
                        style="width: 130rem;"
                    >
                      <div class="mini-row-title">
                        列表循环设置
                      </div>
                      <div class="mini-row">
                        <BaseButton size="small" @click="sort(Sort.reverse)">翻转</BaseButton>
                        <BaseButton size="small" @click="sort(Sort.random)">随机</BaseButton>
                      </div>
                    </MiniDialog>
                  </div>
                  <BaseIcon icon="bi:arrow-right"
                            @click="emitter.emit(EventKey.next)"
                            :title="`下一章(快捷键：${settingStore.shortcutKeyMap[ShortcutKey.NextChapter]})`"
                            v-if="store.currentDict.chapterIndex < store.currentDict.chapterWords.length - 1"/>
                </div>
                <div class="right">
                  {{ data.words.length }}个单词
                </div>
              </div>
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
                      title="标记为简单词"
                      icon="material-symbols:check-circle-outline-rounded"/>
                  <BaseIcon
                      v-else
                      class="fill"
                      @click="toggleWordSimple(item)"
                      title="取消标记简单词"
                      icon="material-symbols:check-circle-rounded"/>
                </template>
              </WordList>
              <Empty v-else/>
            </div>
          </template>
        </Panel>
      </div>
    </Teleport>
  </div>
</template>

<style scoped lang="scss">
@import "@/assets/css/variable";

.practice-word {
  height: 100%;
  flex: 1;
  display: flex;
  //display: none;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  font-size: 14rem;
  color: gray;
  gap: 6rem;
  position: relative;
  width: var(--toolbar-width);

  .near-word {
    position: absolute;
    top: 0;
    width: 100%;

    & > div {
      width: 45%;
      align-items: center;

      .arrow {
        min-width: 22rem;
        min-height: 22rem;
      }
    }

    .word {
      font-size: 24rem;
      margin-bottom: 4rem;
      font-family: var(--word-font-family);
    }

    .prev {
      cursor: pointer;
      display: flex;
      float: left;
      gap: 10rem;
    }

    .next {
      cursor: pointer;
      display: flex;
      justify-content: flex-end;
      gap: 10rem;
      float: right;
    }
  }

  .options-wrapper {
    position: absolute;
    margin-top: 120rem;
  }
}

.word-panel-wrapper {
  position: fixed;
  left: 0;
  top: 10rem;
  z-index: 1;
  margin-left: var(--panel-margin-left);
  height: calc(100% - 20rem);
}

</style>