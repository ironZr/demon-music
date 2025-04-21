<script setup lang="ts">
import { computed, ref } from 'vue'
import { usePlayerStore } from '@/stores/player'

const store = usePlayerStore()
const canPrev = computed(() => store.playlist.length > 1)
const canNext = computed(() => store.playlist.length > 1)
const isVolumeVisible = ref(false)

// 播放模式文本映射
const modeTextMap = {
  'repeat-one': '单曲循环',
  'repeat-all': '列表循环',
  'shuffle': '随机播放'
}

// 播放模式图标映射
const modeIconMap = {
  'repeat-one': 'i-repeat-one',
  'repeat-all': 'i-repeat',
  'shuffle': 'i-shuffle'
}

function onPrev() {
  if (canPrev.value) store.prev()
}

function onNext() {
  if (canNext.value) store.next()
}

function onPlayPause() {
  store.isPlaying ? store.pause() : store.play()
}

function onVolumeChange(e: Event) {
  const target = e.target as HTMLInputElement
  store.setVolume(Number(target.value))
}

function onModeChange() {
  const modes = ['repeat-one', 'repeat-all', 'shuffle']
  const idx = modes.indexOf(store.mode)
  store.setMode(modes[(idx + 1) % modes.length] as any)
}

function toggleVolumePanel() {
  isVolumeVisible.value = !isVolumeVisible.value
}
</script>

<template>
  <div class="player-controls relative">
    <!-- 主控制区 -->
    <div class="flex items-center justify-center gap-6">
      <!-- 播放模式按钮 -->
      <button 
        @click="onModeChange" 
        class="control-btn text-gray-600 group relative"
        :title="modeTextMap[store.mode]"
      >
        <div class="w-6 h-6 flex items-center justify-center">
          <svg v-if="store.mode === 'repeat-one'" xmlns="http://www.w3.org/2000/svg" class="icon" viewBox="0 0 24 24">
            <path fill="currentColor" d="M17 17H7V14L3 18l4 4v-3h12v-6h-2zM7 7h10v3l4-4l-4-4v3H5v6h2z"/>
            <text x="12" y="16" text-anchor="middle" font-size="8" font-weight="bold" fill="currentColor">1</text>
          </svg>
          <svg v-else-if="store.mode === 'repeat-all'" xmlns="http://www.w3.org/2000/svg" class="icon" viewBox="0 0 24 24">
            <path fill="currentColor" d="M17 17H7V14L3 18l4 4v-3h12v-6h-2zM7 7h10v3l4-4l-4-4v3H5v6h2z"/>
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" class="icon" viewBox="0 0 24 24">
            <path fill="currentColor" d="M10.59 9.17L5.41 4L4 5.41l5.17 5.17l1.42-1.41zM14.5 4l2.04 2.04L4 18.59L5.41 20L17.96 7.46L20 9.5V4h-5.5zm0.33 9.41l-1.41 1.41l3.13 3.13L14.5 20H20v-5.5l-2.04 2.04l-3.13-3.13z"/>
          </svg>
        </div>
        <span class="tooltip">{{ modeTextMap[store.mode] }}</span>
      </button>
      
      <!-- 上一首按钮 -->
      <button 
        @click="onPrev" 
        :disabled="!canPrev" 
        class="control-btn" 
        :class="{'opacity-50 cursor-not-allowed': !canPrev}"
      >
        <div class="w-8 h-8 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="icon" viewBox="0 0 24 24">
            <path fill="currentColor" d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
          </svg>
        </div>
      </button>
      
      <!-- 播放/暂停按钮 -->
      <button @click="onPlayPause" class="play-btn">
        <div class="w-12 h-12 flex items-center justify-center">
          <svg v-if="store.isPlaying" xmlns="http://www.w3.org/2000/svg" class="icon" viewBox="0 0 24 24">
            <path fill="currentColor" d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" class="icon" viewBox="0 0 24 24">
            <path fill="currentColor" d="M8 5v14l11-7z"/>
          </svg>
        </div>
      </button>
      
      <!-- 下一首按钮 -->
      <button 
        @click="onNext" 
        :disabled="!canNext" 
        class="control-btn"
        :class="{'opacity-50 cursor-not-allowed': !canNext}"
      >
        <div class="w-8 h-8 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="icon" viewBox="0 0 24 24">
            <path fill="currentColor" d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
          </svg>
        </div>
      </button>
      
      <!-- 音量控制按钮 -->
      <div class="relative">
        <button @click="toggleVolumePanel" class="control-btn group">
          <div class="w-6 h-6 flex items-center justify-center">
            <svg v-if="store.volume > 0.5" xmlns="http://www.w3.org/2000/svg" class="icon" viewBox="0 0 24 24">
              <path fill="currentColor" d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
            </svg>
            <svg v-else-if="store.volume > 0" xmlns="http://www.w3.org/2000/svg" class="icon" viewBox="0 0 24 24">
              <path fill="currentColor" d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" class="icon" viewBox="0 0 24 24">
              <path fill="currentColor" d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
            </svg>
          </div>
          <span class="tooltip">音量</span>
        </button>
        
        <!-- 音量滑块面板 -->
        <div v-show="isVolumeVisible" class="volume-panel">
          <input 
            type="range" 
            min="0" 
            max="1" 
            step="0.01" 
            :value="store.volume" 
            @input="onVolumeChange" 
            class="volume-slider" 
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.player-controls {
  @apply py-4 px-2 rounded-full bg-white shadow-md;
  width: 100%;
  max-width: 400px;
}

.control-btn {
  @apply text-gray-700 hover:text-blue-600 transition-all duration-200 relative;
}

.play-btn {
  @apply bg-blue-600 text-white rounded-full hover:bg-blue-700 hover:shadow-lg transition-all duration-200;
  transform: scale(1);
  transition: transform 0.2s ease;
}

.play-btn:hover {
  transform: scale(1.05);
}

.play-btn:active {
  transform: scale(0.95);
}

.icon {
  width: 100%;
  height: 100%;
}

.tooltip {
  @apply absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 invisible transition-opacity duration-200;
  white-space: nowrap;
}

.control-btn:hover .tooltip {
  @apply opacity-100 visible;
}

.volume-panel {
  @apply absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-2 bg-white shadow-lg rounded-lg;
  width: 120px;
}

.volume-slider {
  @apply w-full h-1.5 rounded-full bg-gray-200 appearance-none cursor-pointer;
}

.volume-slider::-webkit-slider-thumb {
  @apply appearance-none w-3 h-3 rounded-full bg-blue-600;
}

.volume-slider::-moz-range-thumb {
  @apply w-3 h-3 rounded-full bg-blue-600 border-0;
}
</style>
