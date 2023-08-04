export type Config = {
  newWords: Word[],
  skipWords: Word[],
  skipWordNames: string[],
  dict: string,
  chapterIndex: number,
  wordIndex: number,
}
export type Word = { "name": string, "usphone": string, "ukphone": string, "trans": string[] }

export const SaveKey = 'bb-word-config'
