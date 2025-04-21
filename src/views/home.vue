<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import PlayerController from '@/components/player/player-controller.vue'
import PlayerInfo from '@/components/player/player-info.vue'
import LyricDisplay from '@/components/player/lyric-display.vue'
import { usePlayerStore } from '@/stores/player'
import { musicList, musicLibrary, musicGroups, getGroupSongs } from '@/assets/mock/music-list'
import { useAudio } from '@/composables/use-audio'
import type { MusicGroup } from '@/types/music'

const store = usePlayerStore()
const { currentTime, duration, seek } = useAudio()

// 显示模式
const displayMode = ref('normal') // 'normal', 'lyrics', 'playlist'

// 当前歌曲
const currentMusic = computed(() => store.current)

// 音乐分组
const groups = ref<MusicGroup[]>(musicGroups)

// 切换分组展开/收起状态
function toggleGroup(groupId: string) {
  const group = groups.value.find(g => g.id === groupId)
  if (group) {
    group.expanded = !group.expanded
  }
}

// 播放指定分组的所有歌曲
function playGroup(groupId: string) {
  const groupSongs = getGroupSongs(groupId)
  if (groupSongs.length > 0) {
    store.setPlaylist(groupSongs)
    store.play(0)
  }
}

// 初始化播放列表
onMounted(() => {
  store.setPlaylist(musicList)
})

// 格式化时间
function formatTime(seconds: number): string {
  if (isNaN(seconds)) return '00:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

// 进度条拖动
function onProgressChange(e: Event) {
  const target = e.target as HTMLInputElement
  seek(Number(target.value))
}

// 播放指定歌曲
function playSong(index: number) {
  store.play(index)
  // 切换到正常模式
  displayMode.value = 'normal'
}

// 切换显示模式
function toggleDisplayMode(mode: string) {
  displayMode.value = displayMode.value === mode ? 'normal' : mode
}

// 计算进度百分比
const progressPercentage = computed(() => {
  if (!duration.value) return 0
  return (currentTime.value / duration.value) * 100
})
</script>

<template>
  <div class="music-player-container">
    <!-- 背景模糊效果 -->
    <div class="app-background" :style="{
      backgroundImage: currentMusic?.cover ? `url(${currentMusic.cover})` : 'linear-gradient(to bottom right, #8e2de2, #4a00e0)'
    }"></div>
    
    <div class="player-content">
      <!-- 正常模式：封面+控制器 -->
      <div v-show="displayMode === 'normal'" class="flex flex-col items-center gap-6">
        <PlayerInfo />
        
        <!-- 进度条 -->
        <div class="progress-container">
          <div class="time-display">{{ formatTime(currentTime) }}</div>
          
          <div class="progress-bar-wrapper" @click="(e) => {
            const rect = e.currentTarget.getBoundingClientRect()
            const percentage = (e.clientX - rect.left) / rect.width
            seek(percentage * (duration || 0))
          }">
            <div class="progress-bar-bg"></div>
            <div class="progress-bar-fill" :style="{ width: `${progressPercentage}%` }"></div>
            <div class="progress-handle" :style="{ left: `${progressPercentage}%` }"></div>
          </div>
          
          <div class="time-display">{{ formatTime(duration) }}</div>
        </div>
        
        <!-- 控制器 -->
        <PlayerController />
        
        <!-- 切换按钮 -->
        <div class="mode-switcher flex items-center gap-2">
          <button @click="toggleDisplayMode('lyrics')" class="mode-btn px-4 py-1 rounded-full bg-white/50 hover:bg-white/80 transition duration-150 text-xl">
            <span class="font-bold text-[#8e2de2] text-2xl" style="font-size: 15px;">歌词 </span>
          </button>
          <button @click="toggleDisplayMode('playlist')" class="mode-btn px-4 py-1 rounded-full bg-white/50 hover:bg-white/80 transition duration-150 text-xl">
            <span class="font-bold text-[#8e2de2] text-2xl" style="font-size: 15px;">列表 </span>
          </button>
        </div>
      </div>
      
      <!-- 歌词模式 -->
      <div v-show="displayMode === 'lyrics'" class="mode-panel">
        <div class="mode-header">
          <button @click="displayMode = 'normal'" class="back-btn">
            <svg xmlns="http://www.w3.org/2000/svg" class="icon" viewBox="0 0 24 24">
              <path fill="currentColor" d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
            </svg>
          </button>
          <h2 class="mode-title">歌词</h2>
        </div>
        
        <LyricDisplay :current-time="currentTime" class="flex-1" />
        
        <!-- 简化版控制器 -->
        <div class="mini-controls">
          <div class="progress-mini">
            <div class="progress-bar-bg"></div>
            <div class="progress-bar-fill" :style="{ width: `${progressPercentage}%` }"></div>
          </div>
          <div class="flex items-center justify-between w-full px-4 py-2">
            <div class="text-sm">{{ formatTime(currentTime) }} / {{ formatTime(duration) }}</div>
            <button @click="onPlayPause" class="mini-play-btn">
              <svg v-if="store.isPlaying" xmlns="http://www.w3.org/2000/svg" class="icon" viewBox="0 0 24 24">
                <path fill="currentColor" d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" class="icon" viewBox="0 0 24 24">
                <path fill="currentColor" d="M8 5v14l11-7z"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      <!-- 播放列表模式 -->
      <div v-show="displayMode === 'playlist'" class="mode-panel bg-white">
        <div class="mode-header">
          <button @click="displayMode = 'normal'" class="back-btn">
            <svg xmlns="http://www.w3.org/2000/svg" class="icon" viewBox="0 0 24 24">
              <path fill="currentColor" d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
            </svg>
          </button>
          <h2 class="mode-title">播放列表</h2>
        </div>
        
        <!-- 播放列表 -->
        <div class="playlist">
          <!-- 分组/文件夹 -->
          <div v-for="group in groups" :key="group.id" class="playlist-group">
            <!-- 分组标题栏 -->
            <div class="playlist-group-header" @click="toggleGroup(group.id)">
              <div class="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="icon mr-2" :class="{'rotate-90': group.expanded}" viewBox="0 0 24 24" width="20" height="20">
                  <path fill="currentColor" d="M10 17l5-5-5-5v10z"/>
                </svg>
                <span class="font-medium">{{ group.name }}</span>
              </div>
              <div class="flex items-center">
                <button @click.stop="playGroup(group.id)" class="play-group-btn">
                  <svg xmlns="http://www.w3.org/2000/svg" class="icon" viewBox="0 0 24 24" width="20" height="20">
                    <path fill="currentColor" d="M8 5v14l11-7z"/>
                  </svg>
                </button>
                <span class="text-xs ml-2">{{ getGroupSongs(group.id).length }} 首</span>
              </div>
            </div>
            
            <!-- 分组内的歌曲 -->
            <div v-if="group.expanded" class="playlist-group-songs">
              <div 
                v-for="song in getGroupSongs(group.id)" 
                :key="song.id"
                @click="playSong(store.playlist.findIndex(s => s.id === song.id))"
                :class="['playlist-item', song.id === store.current?.id ? 'active' : '']"
              >
                <div class="playlist-item-info">
                  <div class="playlist-item-title">{{ song.title }}</div>
                  <div class="playlist-item-artist">{{ song.artist }}</div>
                </div>
                <div class="playlist-item-duration">{{ formatTime(song.duration) }}</div>
              </div>
            </div>
          </div>
          
          <!-- 当前播放列表 -->
          <div class="playlist-current mt-4">
            <div class="playlist-group-header">
              <span class="font-medium">当前播放列表</span>
              <span class="text-xs">{{ store.playlist.length }} 首</span>
            </div>
            <div 
              v-for="(song, index) in store.playlist" 
              :key="song.id"
              @click="playSong(index)"
              :class="['playlist-item', index === store.currentIndex ? 'active' : '']"
            >
              <div class="playlist-item-number">{{ index + 1 }}</div>
              <div class="playlist-item-info">
                <div class="playlist-item-title">{{ song.title }}</div>
                <div class="playlist-item-artist">{{ song.artist }}</div>
              </div>
              <div class="playlist-item-duration">{{ formatTime(song.duration) }}</div>
            </div>
          </div>
        </div>
        
        <!-- 简化版控制器 -->
        <div class="mini-controls bg-gray-100">
          <div class="progress-mini">
            <div class="progress-bar-bg"></div>
            <div class="progress-bar-fill" :style="{ width: `${progressPercentage}%` }"></div>
          </div>
          <div class="flex items-center justify-between w-full px-4 py-3">
            <div class="text-sm text-gray-700">{{ formatTime(currentTime) }} / {{ formatTime(duration) }}</div>
            <button @click="store.isPlaying ? store.pause() : store.play()" class="mini-play-btn">
              <svg v-if="store.isPlaying" xmlns="http://www.w3.org/2000/svg" class="icon" viewBox="0 0 24 24">
                <path fill="currentColor" d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" class="icon" viewBox="0 0 24 24">
                <path fill="currentColor" d="M8 5v14l11-7z"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.music-player-container {
  @apply relative min-h-screen flex items-center justify-center;
}

.app-background {
  @apply fixed inset-0 bg-center bg-cover;
  filter: blur(50px) brightness(0.5);
  transform: scale(1.2);
  z-index: -1;
}

.player-content {
  @apply relative w-full max-w-md mx-auto bg-white bg-opacity-10 backdrop-blur-xl rounded-xl overflow-hidden shadow-2xl;
  min-height: 80vh;
  max-height: 90vh;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.progress-container {
  @apply flex items-center gap-2 w-full px-6;
}

.time-display {
  @apply text-xs text-white opacity-80;
}

.progress-bar-wrapper {
  @apply relative flex-1 h-1 rounded-full cursor-pointer;
}

.progress-bar-bg {
  @apply absolute inset-0 bg-gray-300 rounded-full;
}

.progress-bar-fill {
  @apply absolute top-0 bottom-0 left-0 bg-red-500 rounded-full;
  transition: width 0.1s linear;
}

.progress-handle {
  @apply absolute top-1/2 w-3 h-3 bg-white rounded-full shadow-md;
  transform: translate(-50%, -50%);
  transition: left 0.1s linear;
}

.mode-switcher {
  @apply flex justify-center gap-8 mt-4;
}

.mode-btn {
  @apply flex flex-col items-center text-white opacity-70 hover:opacity-100 transition-opacity;
}

.mode-btn .icon {
  @apply w-6 h-6 mb-1;
}

.mode-btn span {
  @apply text-xs;
}

.mode-panel {
  @apply flex flex-col h-full;
  height: 80vh;
}

.mode-header {
  @apply flex items-center p-4 border-b border-gray-200;
  background-color: #fafafa;
}

.back-btn {
  @apply text-gray-700 mr-4;
}

.back-btn .icon {
  @apply w-6 h-6;
}

.mode-title {
  @apply text-lg font-bold text-gray-800;
}

.playlist {
  @apply flex-1 overflow-y-auto py-2 bg-white;
  scrollbar-width: thin;
  scrollbar-color: rgba(180, 180, 180, 0.5) transparent;
}

.playlist::-webkit-scrollbar {
  width: 4px;
}

.playlist::-webkit-scrollbar-track {
  background: #f5f5f5;
}

.playlist::-webkit-scrollbar-thumb {
  background-color: rgba(180, 180, 180, 0.5);
  border-radius: 4px;
}

.playlist-group {
  @apply mb-4;
}

.playlist-group-header {
  @apply flex items-center justify-between px-4 py-2 font-medium cursor-pointer transition-colors;
  background: #f5f5f5;
  color: #333;
}

.playlist-group-header:hover {
  background: #eeeeee;
}

.playlist-group-header .icon {
  @apply transition-transform duration-300;
}

.playlist-group-songs {
  @apply pl-4;
}

.play-group-btn {
  @apply flex items-center justify-center w-6 h-6 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors;
}

.playlist-current {
  @apply border-t border-gray-200 pt-2 mt-2;
}

.playlist-item {
  @apply flex items-center px-4 py-3 text-gray-800 cursor-pointer transition-colors;
}

.playlist-item:hover {
  @apply bg-gray-100;
}

.playlist-item.active {
  @apply bg-red-100 text-red-800;
}

.playlist-item-number {
  @apply w-8 text-center text-gray-500;
}

.playlist-item-info {
  @apply flex-1 ml-2;
}

.playlist-item-title {
  @apply font-medium truncate text-gray-800;
}

.playlist-item-artist {
  @apply text-xs text-gray-500 truncate;
}

.playlist-item-duration {
  @apply text-xs text-gray-500;
}

.mini-controls {
  @apply mt-auto;
}

.progress-mini {
  @apply relative h-1;
}

.mini-play-btn {
  @apply w-10 h-10 flex items-center justify-center text-white bg-red-600 rounded-full shadow-md hover:bg-red-700 transition-colors;
}

.mini-play-btn .icon {
  @apply w-6 h-6;
}
</style>
