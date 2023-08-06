import {PronunciationApi} from "../types";

export function usePlayWordAudio() {
  const audio = $ref(new Audio())

  function generateWordSoundSrc(word: string, pronunciation: string) {
    switch (pronunciation) {
      case 'uk':
        return `${PronunciationApi}${word}&type=1`
      case 'us':
        return `${PronunciationApi}${word}&type=2`
    }
  }

  function playAudio(word: string) {
    audio.src = generateWordSoundSrc(word, 'us')
    audio.play()
  }

  return [playAudio]
}
