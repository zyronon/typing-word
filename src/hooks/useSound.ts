import {onMounted} from "vue"

export function useSound(srcList?: string[], num?: number) {
  let audioList: HTMLAudioElement[] = $ref([])
  let audioLength = $ref(1)
  const setAudio = (srcList2: string[], num2?: number) => {
    if (num2) audioLength = num2
    audioList = []
    for (let i = 0; i < audioLength; i++) {
      srcList2.map(src => {
        audioList.push(new Audio(src))
      })
    }
    index = 0
  }

  onMounted(() => {
    if (srcList) setAudio(srcList, num)
  })

  let index = $ref(0)
  const play = () => {
    index++
    if (audioList.length > 1 && audioList.length !== audioLength) {
      audioList[index % audioList.length].play()
    } else {
      audioList[index % audioLength].play()
    }
  }
  return [
    play,
    setAudio
  ]
}
