import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { Music } from '@/types/music'

interface PlayerState {
  current: Music | null
  playlist: Music[]
  currentIndex: number
  isPlaying: boolean
  volume: number
  mode: 'repeat-one' | 'repeat-all' | 'shuffle'
}

export const usePlayerStore = defineStore('player', () => {
  const current = ref<Music | null>(null)
  const playlist = ref<Music[]>([])
  const currentIndex = ref(0)
  const isPlaying = ref(false)
  const volume = ref(0.8)
  const mode = ref<'repeat-one' | 'repeat-all' | 'shuffle'>('repeat-all')

  function setPlaylist(list: Music[], index = 0) {
    playlist.value = list
    currentIndex.value = index
    current.value = list[index] || null
  }

  function play(index?: number) {
    if (typeof index === 'number') {
      currentIndex.value = index
      current.value = playlist.value[index] || null
    }
    isPlaying.value = true
  }

  function pause() {
    isPlaying.value = false
  }

  function next() {
    if (mode.value === 'shuffle') {
      const nextIdx = Math.floor(Math.random() * playlist.value.length)
      currentIndex.value = nextIdx
    } else {
      currentIndex.value = (currentIndex.value + 1) % playlist.value.length
    }
    current.value = playlist.value[currentIndex.value] || null
    isPlaying.value = true
  }

  function prev() {
    if (mode.value === 'shuffle') {
      const prevIdx = Math.floor(Math.random() * playlist.value.length)
      currentIndex.value = prevIdx
    } else {
      currentIndex.value = (currentIndex.value - 1 + playlist.value.length) % playlist.value.length
    }
    current.value = playlist.value[currentIndex.value] || null
    isPlaying.value = true
  }

  function setVolume(val: number) {
    volume.value = Math.max(0, Math.min(1, val))
  }

  function setMode(m: 'repeat-one' | 'repeat-all' | 'shuffle') {
    mode.value = m
  }

  return {
    current,
    playlist,
    currentIndex,
    isPlaying,
    volume,
    mode,
    setPlaylist,
    play,
    pause,
    next,
    prev,
    setVolume,
    setMode
  }
})
