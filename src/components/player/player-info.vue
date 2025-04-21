<script setup lang="ts">
import { computed, ref } from 'vue'
import { usePlayerStore } from '@/stores/player'

const store = usePlayerStore()
const music = computed(() => store.current)

// 使用CSS生成默认封面
const useDefaultCover = computed(() => !music.value?.cover)

// 封面旋转状态
const isRotating = computed(() => store.isPlaying)

// 生成随机背景颜色
const randomBgColor = ref(generateRandomColor())

function generateRandomColor() {
  // 生成柔和的暗色调背景色
  const h = Math.floor(Math.random() * 360)
  return `hsl(${h}, 70%, 85%)`
}
</script>

<template>
  <div class="player-info">
    <!-- 背景模糊效果 -->
    <div 
      class="album-bg" 
      :style="{
        backgroundImage: music?.cover ? `url(${music.cover})` : `radial-gradient(${randomBgColor}, #f5f5f5)`,
      }"
    ></div>
    
    <!-- 封面和信息 -->
    <div class="content-wrapper">
      <!-- 封面区域 -->
      <div class="album-cover-container">
        <div class="album-disc" :class="{ 'is-rotating': isRotating }">
          <div class="album-hole"></div>
          <div class="album-cover">
            <img
              v-if="!useDefaultCover"
              :src="music?.cover"
              :alt="music?.title || '未知歌曲'"
              class="w-full h-full object-cover"
              loading="lazy"
            />
            <div v-else class="default-cover-placeholder">
              <svg xmlns="http://www.w3.org/2000/svg" class="icon" viewBox="0 0 24 24">
                <path fill="currentColor" d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6zm-2 16c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/>
              </svg>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 歌曲信息 -->
      <div class="music-info">
        <div class="title">{{ music?.title || '未播放' }}</div>
        <div class="artist">{{ music?.artist || '未知艺术家' }}</div>
        <div class="album" v-if="music?.album">{{ music.album }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.player-info {
  @apply relative w-full max-w-md mx-auto rounded-xl overflow-hidden shadow-lg;
  height: 280px;
}

.album-bg {
  @apply absolute inset-0 bg-center bg-cover;
  filter: blur(30px) brightness(0.7);
  transform: scale(1.2);
  z-index: 0;
}

.content-wrapper {
  @apply relative flex flex-col items-center justify-center h-full z-10 p-4;
  background: linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.6));
}

.album-cover-container {
  @apply relative mb-6;
  perspective: 1000px;
}

.album-disc {
  @apply relative rounded-full shadow-xl;
  width: 180px;
  height: 180px;
  background: linear-gradient(145deg, #333, #111);
  transform-style: preserve-3d;
  transition: transform 0.5s ease;
}

.album-disc.is-rotating {
  animation: spin-disc 12s linear infinite;
}

.album-hole {
  @apply absolute rounded-full bg-gray-900 border-4 border-gray-800;
  width: 30px;
  height: 30px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 2;
}

.album-cover {
  @apply absolute rounded-full overflow-hidden;
  width: 120px;
  height: 120px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1;
  box-shadow: 0 0 10px rgba(0,0,0,0.5);
}

.default-cover-placeholder {
  @apply w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-400 to-purple-600;
}

.default-cover-placeholder .icon {
  @apply w-16 h-16 text-white opacity-80;
}

.music-info {
  @apply text-center text-white;
}

.title {
  @apply text-xl font-bold mb-1 truncate max-w-xs;
  text-shadow: 0 1px 3px rgba(0,0,0,0.8);
}

.artist {
  @apply text-sm font-medium mb-1 opacity-90 truncate max-w-xs;
  text-shadow: 0 1px 2px rgba(0,0,0,0.6);
}

.album {
  @apply text-xs opacity-75 truncate max-w-xs;
  text-shadow: 0 1px 1px rgba(0,0,0,0.5);
}

@keyframes spin-disc {
  0% { transform: rotateZ(0deg); }
  100% { transform: rotateZ(360deg); }
}
</style>
