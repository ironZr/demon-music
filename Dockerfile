# 构建阶段
FROM node:18-alpine as build-stage

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 package-lock.json
COPY package*.json ./

# 安装依赖
RUN npm install

# 复制项目文件
COPY . .

# 构建应用（跳过类型检查）
RUN npm run build

# 如果上面的命令仍然失败，可以直接使用 vite build
# RUN npx vite build

# 生产阶段
FROM nginx:stable-alpine as production-stage

# 将构建好的文件复制到 Nginx 的默认目录
COPY --from=build-stage /app/dist /usr/share/nginx/html

# 复制自定义的 Nginx 配置（可选）
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# 暴露 80 端口
EXPOSE 80

# 启动 Nginx
CMD ["nginx", "-g", "daemon off;"]
