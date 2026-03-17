# 工具网站

一个包含多个开发工具的静态网站。

## 工具列表

- **MongoDB ObjectId 转换**: 在 MongoDB ObjectId 和 Unix 时间戳之间转换
- **时间戳转换**: 各种精度的 Unix 时间戳和人类可读时间格式转换
- **豆包视频下载**: 从豆包视频分享链接获取下载地址

## 技术栈

- **前端框架**: Svelte 5
- **构建工具**: Vite
- **静态站点生成**: SvelteKit with adapter-static

## 开发

```bash
# 安装依赖
npm install

# 开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview
```

## 部署

构建后的静态文件位于 `build` 目录，可以部署到任何静态文件服务器，如：

- Vercel
- Netlify
- GitHub Pages
- 任何支持静态文件的服务器

## 功能说明

### MongoDB ObjectId 转换
- ObjectId 前4个字节包含创建时间戳
- 支持双向转换：ObjectId ↔ Unix 时间戳

### 时间戳转换
- 支持秒、毫秒、微秒、纳秒精度
- 输出多种日期时间格式：ISO 8601, RFC 2822, 本地时间, UTC

### 豆包视频下载
- 解析豆包视频分享链接
- 提取 share_id 和 video_id 参数
- 提供 API 调用示例和 cURL 命令