<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { usePlayerStore } from '@/stores/player'
import type { LyricLine } from '@/types/music'

interface Props {
  currentTime?: number
}

const props = withDefaults(defineProps<Props>(), {
  currentTime: 0
})

const store = usePlayerStore()
const lyricContainer = ref<HTMLElement | null>(null)
const lyricLineElements = ref<HTMLElement[]>([])

// 当前播放的歌词行索引
const currentLine = ref(0)

// 解析歌词行
const lyricLines = computed<LyricLine[]>(() => {
  if (!store.current?.lyric) return []
  
  // 解析歌词文本为时间和文本对象的数组
  const lines = store.current.lyric.split('\n')
    .map(line => {
      // 匹配时间标签 [分钟:秒.毫秒]
      const match = line.match(/\[(\d+):(\d+\.\d+)\](.*)/) 
      if (!match) return { time: 0, text: line }
      
      const [, min, sec, text] = match
      return { 
        time: Number(min) * 60 + Number(sec), 
        text: text.trim() // 移除文本前后的空格
      }
    })
    .filter(line => line.text) // 过滤掉空行
    .sort((a, b) => a.time - b.time) // 按时间排序
  
  return lines
})

// 在组件挂载后初始化
onMounted(() => {
  // 初始化完成后延迟执行滚动，确保 DOM 已经渲染
  nextTick(() => {
    updateLyricLineElements()
    // 初始化时尝试滚动到当前行
    scrollToLine(currentLine.value, false)
  })
})

// 监听歌曲变化，重置当前行和滚动位置
watch(() => store.current, () => {
  currentLine.value = 0
  
  // 等待DOM更新后再滚动
  nextTick(() => {
    updateLyricLineElements()
    scrollToLine(0, false)
  })
})

// 监听歌词数组变化，更新元素引用
watch(lyricLines, () => {
  nextTick(() => {
    updateLyricLineElements()
  })
})

// 更新歌词行元素引用数组
function updateLyricLineElements() {
  if (!lyricContainer.value) return
  
  // 获取所有歌词行元素
  const elements = lyricContainer.value.querySelectorAll('.lyric-line')
  lyricLineElements.value = Array.from(elements) as HTMLElement[]
}

// 监听当前播放时间，更新当前歌词行
watch(() => props.currentTime, (newTime) => {
  if (!lyricLines.value.length) return
  
  // 找到当前时间对应的歌词行
  let idx = lyricLines.value.findIndex(line => line.time > newTime)
  if (idx === -1) {
    // 如果没有找到，说明已经到了最后一行
    idx = lyricLines.value.length
  }
  
  // 当前行是时间小于当前播放时间的最后一行
  const newLineIndex = Math.max(0, idx - 1)
  
  // 只有当行号变化时才滚动
  if (newLineIndex !== currentLine.value) {
    currentLine.value = newLineIndex
    scrollToLine(newLineIndex, true)
  }
})

// 滚动到指定行
function scrollToLine(lineIndex: number, smooth = true) {
  if (!lyricContainer.value || lyricLineElements.value.length === 0) return
  
  // 确保行索引在有效范围内
  if (lineIndex >= lyricLineElements.value.length) {
    lineIndex = lyricLineElements.value.length - 1
  }
  
  // 获取目标行元素
  const targetLine = lyricLineElements.value[lineIndex]
  if (!targetLine) return
  
  // 计算滚动位置：目标行位置减去容器高度的一半，使当前行居中
  const containerHeight = lyricContainer.value.clientHeight
  const targetPosition = targetLine.offsetTop - (containerHeight / 2) + (targetLine.clientHeight / 2)
  
  // 滚动到目标位置
  lyricContainer.value.scrollTo({
    top: Math.max(0, targetPosition),
    behavior: smooth ? 'smooth' : 'auto'
  })
  
  // 强制在下一帧重新滚动，确保准确定位
  if (smooth) {
    requestAnimationFrame(() => {
      if (lyricContainer.value) {
        lyricContainer.value.scrollTo({
          top: Math.max(0, targetPosition),
          behavior: 'smooth'
        })
      }
    })
  }
}
</script>
<template>
  <div ref="lyricContainer" class="lyric-container overflow-y-auto h-60 text-center px-2 py-4 bg-white rounded-xl shadow-md">
    <div v-if="lyricLines.length === 0" class="text-gray-500 py-4">
      暂无歌词
    </div>
    <div v-else class="relative">
      <!-- 添加顶部空白，使第一行歌词可以滚动到中间位置 -->
      <div class="h-28"></div>
      
      <div
        v-for="(line, idx) in lyricLines"
        :key="idx"
        :class="[
          'lyric-line py-2 my-1 transition-all duration-300 ease-in-out', 
          idx === currentLine ? 'current-line text-red-500 font-bold text-base scale-110' : 'text-gray-700 text-sm'
        ]"
      >
        {{ line.text || '♪' }}
      </div>
      
      <!-- 添加底部空白，使最后一行歌词可以滚动到中间位置 -->
      <div class="h-28"></div>
      
      <!-- 移除了中间指示线 -->
      <!-- <div class="absolute left-0 right-0 h-px bg-red-400 pointer-events-none" style="top: 50%;"></div> -->
    </div>
  </div>
</template>

<style scoped>
.lyric-container {
  scrollbar-width: thin;
  scrollbar-color: rgba(156, 163, 175, 0.5) transparent;
  scroll-behavior: smooth;
  position: relative;
  /* 防止滚动条影响内容宽度 */
  padding-right: 10px;
}

.lyric-container::-webkit-scrollbar {
  width: 4px;
}

.lyric-container::-webkit-scrollbar-track {
  background: transparent;
}

.lyric-container::-webkit-scrollbar-thumb {
  background-color: rgba(156, 163, 175, 0.5);
  border-radius: 4px;
}

.lyric-line {
  transform-origin: center;
  line-height: 1.6;
  padding: 4px 0;
  white-space: normal;
  word-break: break-word;
  transition: all 0.3s ease;
}

.current-line {
  color: #f87171; /* red-400 */
  font-weight: bold;
  font-size: 1rem;
  transform: scale(1.1);
  text-shadow: 0 0 8px rgba(248, 113, 113, 0.6);
}
</style>
