import { ref, watch, onUnmounted, type Ref } from 'vue'
import { usePlayerStore } from '@/stores/player'

interface UseAudio {
  audio: HTMLAudioElement
  currentTime: Ref<number>
  duration: Ref<number>
  isReady: Ref<boolean>
  seek: (time: number) => void
  setVolume: (volume: number) => void
}

export function useAudio(): UseAudio {
  const store = usePlayerStore()
  const audio = new Audio()
  const currentTime = ref(0)
  const duration = ref(0)
  const isReady = ref(false)

  // 监听当前歌曲变化
  watch(() => store.current, (music) => {
    if (music) {
      audio.src = music.url
      audio.load()
      // 根据当前播放状态决定是否自动播放
      if (store.isPlaying) {
        audio.play().catch(err => {
          console.error('播放失败:', err)
          store.pause() // 如果播放失败，更新状态为暂停
        })
      }
    } else {
      audio.pause()
    }
  })
  
  // 监听播放状态变化
  watch(() => store.isPlaying, (isPlaying) => {
    if (isPlaying) {
      if (audio.src) {
        audio.play().catch(err => {
          console.error('播放失败:', err)
          store.pause() // 如果播放失败，更新状态为暂停
        })
      }
    } else {
      audio.pause()
    }
  })

  audio.addEventListener('timeupdate', () => {
    currentTime.value = audio.currentTime
    duration.value = audio.duration
  })
  audio.addEventListener('canplay', () => {
    isReady.value = true
  })
  audio.addEventListener('ended', () => {
    if (store.mode === 'repeat-one') {
      audio.currentTime = 0
      audio.play()
    } else {
      store.next()
    }
  })

  function seek(time: number) {
    audio.currentTime = time
  }
  function setVolume(volume: number) {
    audio.volume = volume
  }

  onUnmounted(() => {
    audio.pause()
    audio.src = ''
  })

  return {
    audio,
    currentTime,
    duration,
    isReady,
    seek,
    setVolume
  }
}
