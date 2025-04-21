// 音乐相关接口定义
export interface Music {
  id: string
  title: string
  artist: string
  album: string
  cover?: string // 封面图片URL，可选
  url: string   // 音频文件URL
  duration: number // 单位：秒
  lyric?: string // 歌词文本，可选
  groupId?: string // 所属分组ID，可选
}

export interface LyricLine {
  time: number // 时间戳，单位：秒
  text: string
}

// 音乐分组/文件夹接口定义
export interface MusicGroup {
  id: string
  name: string
  description?: string
  cover?: string // 分组封面图片URL，可选
  expanded?: boolean // 是否展开显示，默认为false
}

// 包含分组的音乐列表结构
export interface MusicLibrary {
  groups: MusicGroup[]
  songs: Music[]
}
