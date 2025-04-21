# Music Demon (音乐恶魔)

一个基于Vue 3 + TypeScript的现代音乐播放器应用，支持FLAC音频文件播放和歌词显示。

## 项目架构

### 技术栈
- **前端框架**: Vue 3 + TypeScript
- **构建工具**: Vite
- **状态管理**: Pinia
- **路由管理**: Vue Router
- **样式**: Tailwind CSS
- **容器化**: Docker + Nginx

### 目录结构
```
music-demon/
├── scripts/                 # 脚本工具
│   └── extract-flac-metadata.js  # 自动扫描音乐文件并生成元数据
├── src/
│   ├── assets/              # 静态资源
│   │   ├── mock/            # 音乐文件和元数据
│   │   └── main.css         # 全局样式
│   ├── components/          # 组件
│   │   └── player/          # 播放器相关组件
│   │       ├── lyric-display.vue    # 歌词显示组件
│   │       ├── player-controller.vue # 播放控制组件
│   │       └── player-info.vue      # 播放信息组件
│   ├── composables/         # 组合式函数
│   │   └── use-audio.ts     # 音频处理逻辑
│   ├── router/              # 路由配置
│   ├── stores/              # 状态管理
│   │   └── player.ts        # 播放器状态
│   ├── types/               # 类型定义
│   │   └── music.ts         # 音乐相关类型
│   ├── views/               # 页面视图
│   │   └── home.vue         # 主页面
│   ├── App.vue              # 根组件
│   └── main.ts              # 入口文件
├── .dockerignore            # Docker忽略文件
├── .gitignore               # Git忽略文件
├── Dockerfile               # Docker配置
├── docker-compose.yml       # Docker Compose配置
├── index.html               # HTML模板
├── nginx.conf               # Nginx配置
├── package.json             # 项目依赖
├── postcss.config.js        # PostCSS配置
├── tailwind.config.js       # Tailwind配置
├── tsconfig.json            # TypeScript配置
└── vite.config.ts           # Vite配置
```

## 核心功能

### 1. 音乐元数据提取
- 使用music-metadata库从FLAC文件中提取元数据
- 自动扫描音乐文件并生成music-list.ts
- 支持提取标题、艺术家、专辑和歌词信息

### 2. 歌词显示与滚动
- 根据歌曲播放时间自动滚动显示当前歌词
- 保持高亮歌词在滚动区域中间位置
- 当前播放歌词使用红色高亮显示
- 非当前歌词使用灰色显示

### 3. 播放控制
- 播放/暂停功能
- 进度条控制
- 音量调节
- 上一曲/下一曲切换

### 4. UI设计
- 模糊背景效果
- 唱片封面旋转动画
- 默认封面占位符
- 三种显示模式：正常模式、歌词模式和播放列表模式
- 红色系主题色调

### 5. 播放列表分组
- 支持歌曲分组管理
- 分组可以展开/收起
- 显示分组名称和歌曲数量
- 支持播放整个分组的功能

## 音乐资源
当前包含以下示例音乐：
- G.E.M. 邓紫棋 - 很久以后.flac
- G.E.M. 邓紫棋 - 死了都要爱.flac

## 开发与部署

### 本地开发
```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

### 构建生产版本
```bash
# 构建
npm run build
```

### Docker部署
```bash
# 使用Docker Compose构建和启动
docker-compose up -d
```

## 未来计划
- 添加更多音乐格式支持
- 实现音乐库搜索功能
- 添加音效均衡器
- 支持播放列表导入/导出
- 实现歌词编辑功能
