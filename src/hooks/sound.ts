import {onMounted, watch, watchEffect} from "vue"
import {useSettingStore} from "@/stores/setting.ts";
import {PronunciationApi} from "@/types.ts";
import beep from "@/assets/sound/beep.wav";
import correct from "@/assets/sound/correct.wav";

export function useSound(urlList?: string[], num?: number) {
    let audioList: HTMLAudioElement[] = $ref([])
    let audioLength = $ref(1)
    let index = $ref(0)

    onMounted(() => {
        if (urlList) setAudio(urlList, num)
    })

    function setAudio(srcList2: string[], num2?: number) {
        if (num2) audioLength = num2
        audioList = []
        for (let i = 0; i < audioLength; i++) {
            srcList2.map(src => audioList.push(new Audio(src)))
        }
        index = 0
    }

    function play() {
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

export function usePlayKeyboardAudio() {
    const settingStore = useSettingStore()
    const [playKeyboardAudio, setAudio] = useSound()

    watchEffect(() => {
        let urlList = getAudioFileUrl(settingStore.keyboardSoundFile)
        setAudio(urlList, urlList.length === 1 ? 3 : 1)
    })
    return playKeyboardAudio
}

export function usePlayBeep() {
    return useSound([beep], 1)[0]
}

export function usePlayCorrect() {
    return useSound([correct], 1)[0]
}

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

    function playWordAudio(word: string) {
        audio.src = generateWordSoundSrc(word, 'us')
        audio.play()
    }

    return playWordAudio
}

export function usePlayAudio(url: string) {
    new Audio(url).play().then(r => void 0)
}

export function getAudioFileUrl(name: string) {
    if (name === '机械') {
        return [
            `/sound/key-sounds/jixie/机械0.mp3`,
            `/sound/key-sounds/jixie/机械1.mp3`,
            `/sound/key-sounds/jixie/机械2.mp3`,
            `/sound/key-sounds/jixie/机械3.mp3`,
        ]
    } else {
        return [`/sound/key-sounds/${name}.mp3`]
    }
}


export function useWatchAllSound() {
    const settingStore = useSettingStore()

    watch([
        () => settingStore.wordSound,
        () => settingStore.keyboardSound,
        () => settingStore.translateSound,
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
    settingStore.translateSound = e
    settingStore.effectSound = e
}