// 提取FLAC文件元数据的脚本
// 使用方法: node extract-flac-metadata.js

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as mm from 'music-metadata';

// 获取当前文件的目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 项目根目录和音乐文件目录
const rootDir = path.resolve(__dirname, '..');
const mockDir = path.join(rootDir, 'src', 'assets', 'mock');
const outputFile = path.join(mockDir, 'music-list.ts');

// 从FLAC文件提取元数据
async function extractFlacMetadata(filePath) {
  try {
    console.log(`分析文件: ${path.basename(filePath)}`);
    
    // 使用music-metadata库解析文件
    const metadata = await mm.parseFile(filePath);
    
    // 提取文件名（不含扩展名）作为备用标题
    const fileName = path.basename(filePath, '.flac');
    
    // 提取常见标签
    const title = metadata.common.title || fileName;
    const artist = metadata.common.artist || '未知艺术家';
    const album = metadata.common.album || '未知专辑';
    
    // 计算时长（秒）
    const duration = Math.round(metadata.format.duration || 0);
    
    // 查找歌词
    let lyric = '';
    
    // 检查是否有LYRICS标签
    if (metadata.native && metadata.native['vorbis']) {
      const vorbisComments = metadata.native['vorbis'];
      
      // 查找LYRICS标签
      for (const comment of vorbisComments) {
        if (comment.id.toUpperCase() === 'LYRICS') {
          lyric = comment.value;
          break;
        }
      }
      
      // 如果没有找到LYRICS标签，尝试查找UNSYNCEDLYRICS标签
      if (!lyric) {
        for (const comment of vorbisComments) {
          if (comment.id.toUpperCase() === 'UNSYNCEDLYRICS') {
            lyric = comment.value;
            break;
          }
        }
      }
    }
    
    // 打印找到的元数据
    console.log(`标题: ${title}`);
    console.log(`艺术家: ${artist}`);
    console.log(`专辑: ${album}`);
    console.log(`时长: ${duration}秒`);
    console.log(`是否找到歌词: ${lyric ? '是' : '否'}`);
    
    // 构建音乐对象
    const music = {
      title,
      artist,
      album,
      duration,
      url: `/src/assets/mock/${path.basename(filePath)}`,
      lyric
    };
    
    return music;
  } catch (error) {
    console.error(`处理文件失败: ${path.basename(filePath)}`, error);
    throw error;
  }
}

// 扫描目录中的所有FLAC文件
async function scanFlacFiles(directory) {
  try {
    const files = await fs.readdir(directory);
    const flacFiles = files.filter(file => file.toLowerCase().endsWith('.flac'));
    
    console.log(`找到 ${flacFiles.length} 个FLAC文件`);
    
    const musicList = [];
    
    for (let i = 0; i < flacFiles.length; i++) {
      const filePath = path.join(directory, flacFiles[i]);
      console.log(`处理文件 (${i + 1}/${flacFiles.length}): ${flacFiles[i]}`);
      
      try {
        const music = await extractFlacMetadata(filePath);
        music.id = i.toString();
        musicList.push(music);
      } catch (error) {
        console.error(`处理文件失败: ${flacFiles[i]}`, error);
        
        // 如果提取元数据失败，创建一个基本的音乐对象
        const fileName = path.basename(filePath, '.flac');
        musicList.push({
          id: i.toString(),
          title: fileName,
          artist: '未知艺术家',
          album: '未知专辑',
          duration: 0,
          url: `/src/assets/mock/${path.basename(filePath)}`,
          lyric: ''
        });
      }
    }
    
    return musicList;
  } catch (error) {
    console.error('扫描目录失败:', error);
    return [];
  }
}

// 根据文件路径或艺术家自动分组
function groupMusicList(musicList) {
  // 创建分组
  const groups = [
    {
      id: 'g1',
      name: '邓紫棋',
      description: 'G.E.M. 邓紫棋的热门歌曲',
      expanded: true
    },
    {
      id: 'g2',
      name: '赵雷',
      description: '赵雷的歌曲',
      expanded: false
    },
    {
      id: 'g3',
      name: '周杰伦',
      description: '周杰伦的歌曲',
      expanded: false
    }
  ];
  
  // 为歌曲分配分组
  const songsWithGroups = musicList.map(song => {
    const artistLower = song.artist.toLowerCase();
    let groupId = null;
    
    if (artistLower.includes('邓紫棋') || artistLower.includes('g.e.m')) {
      groupId = 'g1';
    } else if (artistLower.includes('赵雷')) {
      groupId = 'g2';
    } else if (artistLower.includes('周杰伦') || artistLower.includes('jay')) {
      groupId = 'g3';
    }
    
    return {
      ...song,
      groupId
    };
  });
  
  return {
    groups,
    songs: songsWithGroups
  };
}

// 生成TypeScript代码
function generateTypeScriptCode(musicList) {
  // 分组音乐列表
  const musicLibrary = groupMusicList(musicList);
  
  return `import type { Music, MusicGroup, MusicLibrary } from '@/types/music'

// 定义音乐分组
export const musicGroups: MusicGroup[] = ${JSON.stringify(musicLibrary.groups, null, 2)}

// 定义带分组的歌曲列表
export const musicLibrary: MusicLibrary = {
  groups: musicGroups,
  songs: ${JSON.stringify(musicLibrary.songs, null, 2)}
}

// 为了兼容性保留原来的导出
export const musicList: Music[] = ${JSON.stringify(musicList, null, 2)}

// 获取某个分组下的所有歌曲
export function getGroupSongs(groupId: string): Music[] {
  return musicLibrary.songs.filter(song => song.groupId === groupId)
}

// 获取所有未分组的歌曲
export function getUngroupedSongs(): Music[] {
  return musicLibrary.songs.filter(song => !song.groupId)
}
`;
}

// 主函数
async function main() {
  try {
    console.log('开始扫描FLAC文件...');
    const musicList = await scanFlacFiles(mockDir);
    
    if (musicList.length === 0) {
      console.log('没有找到FLAC文件或无法提取元数据');
      return;
    }
    
    console.log('生成TypeScript代码...');
    const tsCode = generateTypeScriptCode(musicList);
    
    console.log(`写入文件: ${outputFile}`);
    await fs.writeFile(outputFile, tsCode, 'utf8');
    
    console.log('完成!');
  } catch (error) {
    console.error('处理失败:', error);
  }
}

main();
