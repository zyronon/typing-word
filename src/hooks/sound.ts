import {onMounted, watch, watchEffect} from "vue"
import {useSettingStore} from "@/stores/setting.ts";
import {PronunciationApi} from "@/types/types.ts";
import beep from "@/assets/sound/beep.wav";
import correct from "@/assets/sound/correct.wav";

import {SoundFileOptions} from "@/utils/const.ts";
import {useBaseStore} from "@/stores/base.ts";

export function useSound(audioSrcList?: string[], audioFileLength?: number) {
  let audioList: HTMLAudioElement[] = $ref([])
  let audioLength = $ref(1)
  let index = $ref(0)

  onMounted(() => {
    if (audioSrcList) setAudio(audioSrcList, audioFileLength)
  })

  function setAudio(audioSrcList2: string[], audioFileLength2?: number) {
    if (audioFileLength2) audioLength = audioFileLength2
    audioList = []
    for (let i = 0; i < audioLength; i++) {
      audioSrcList2.map(src => audioList.push(new Audio(src)))
    }
    index = 0
  }

  function play(volume: number = 100) {
    index++
    if (audioList.length > 1 && audioList.length !== audioLength) {
      audioList[index % audioList.length].volume = volume / 100
      audioList[index % audioList.length].play()
    } else {
      audioList[index % audioLength].volume = volume / 100
      audioList[index % audioLength].play()
    }
  }

  return {play, setAudio}
}


export function usePlayKeyboardAudio() {
  const settingStore = useSettingStore()
  const {play, setAudio} = useSound()

  watchEffect(() => {
    if (!SoundFileOptions.find(v => v.label === settingStore.keyboardSoundFile)) {
      settingStore.keyboardSoundFile = '机械键盘2'
    }
    let urlList = getAudioFileUrl(settingStore.keyboardSoundFile)
    setAudio(urlList, urlList.length === 1 ? 3 : 1)
  })

  function playAudio() {
    if (settingStore.keyboardSound) {
      play(settingStore.keyboardSoundVolume)
    }
  }

  return playAudio
}

export function usePlayBeep() {
  const settingStore = useSettingStore()
  const {play} = useSound([beep], 1)

  function playAudio() {
    if (settingStore.effectSound) {
      play(settingStore.effectSoundVolume)
    }
  }

  return playAudio
}

export function usePlayCorrect() {
  const settingStore = useSettingStore()
  const {play} = useSound([correct], 1)

  function playAudio() {
    if (settingStore.effectSound) {
      play(settingStore.effectSoundVolume)
    }
  }

  return playAudio
}

export function usePlayWordAudio() {
  const settingStore = useSettingStore()
  const audio = $ref(new Audio())

  function playAudio(word: string) {
    let url = `${PronunciationApi}${word}&type=2`
    if (settingStore.wordSoundType === 'uk') {
      url = `${PronunciationApi}${word}&type=1`
    }
    audio.src = url
    audio.volume = settingStore.wordSoundVolume / 100
    audio.playbackRate = settingStore.wordSoundSpeed
    audio.play()
  }

  return playAudio
}

export function useTTsPlayAudio() {
  let isPlay = $ref(false)

  function play(text: string) {
    // if (isPlay) {
    //   isPlay = false
    //   return window.speechSynthesis.pause();
    // }
    let msg = new SpeechSynthesisUtterance();
    msg.text = text
    msg.rate = 1;
    msg.pitch = 1;
    // msg.lang = 'en-US';
    msg.lang = 'zh-CN';
    isPlay = true
    window.speechSynthesis.speak(msg);
    console.log('text', text)

  }

  return play
}

export function usePlayAudio(url: string) {
  new Audio(url).play().then(r => void 0)
}

export function getAudioFileUrl(name: string) {
  if (name === '机械键盘') {
    return [
      `./sound/key-sounds/jixie/机械0.mp3`,
      `./sound/key-sounds/jixie/机械1.mp3`,
      `./sound/key-sounds/jixie/机械2.mp3`,
      `./sound/key-sounds/jixie/机械3.mp3`,
    ]
  } else {
    return [`./sound/key-sounds/${name}.mp3`]
  }
}

export function useWatchAllSound() {
  const settingStore = useSettingStore()

  watch([
    () => settingStore.wordSound,
    () => settingStore.keyboardSound,
    () => settingStore.effectSound,
  ], (n) => {
    settingStore.allSound = n.some(v => v);
  })
}

export function useChangeAllSound(e: boolean) {
  const settingStore = useSettingStore()

  settingStore.allSound = e
  settingStore.wordSound = e
  settingStore.keyboardSound = e
  settingStore.effectSound = e
}
