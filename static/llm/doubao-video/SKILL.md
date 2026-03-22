---
name: doubao-video
description: 当你需要解析豆包视频分享链接、获取可播放地址或下载地址时，使用这个技能。
---

# 豆包视频下载

这个技能用于处理 `tools.xcrong.me` 提供的豆包视频下载能力。

## 何时使用

在以下场景中使用：

- 用户给出豆包视频分享链接，希望解析视频信息
- 用户需要播放地址或下载地址
- 用户希望知道网页工具入口或公开 API 地址

在以下场景中不要使用：

- 用户没有提供豆包分享链接
- 任务与豆包视频无关

## 公开入口

- 页面地址：`https://tools.xcrong.me/doubao-video`
- API Base：`https://api.tools.xcrong.me`

## API

### 解析接口

- 方法：`POST`
- 地址：`https://api.tools.xcrong.me/api/doubao-video/parse`

请求体：

```json
{
  "shareUrl": "https://www.doubao.com/video-sharing?..."
}
```

常见返回字段：

- `shareId`
- `videoId`
- `videoInfo`
- `streamUrl`
- `backupStreamUrl`
- `downloadUrl`
- `backupDownloadUrl`

### 播放代理接口

- 方法：`GET`
- 地址：`https://api.tools.xcrong.me/api/doubao-video/stream`

### 下载接口

- 方法：`GET`
- 地址：`https://api.tools.xcrong.me/api/doubao-video/download`

## 使用规则

- 需要人工操作时，优先提供网页入口
- 需要集成或自动化时，优先提供 API 地址
- 不要臆造未文档化的参数
- 如果解析失败，明确提示用户检查分享链接是否完整

## 输出建议

- 如果用户要下载豆包视频，优先返回页面地址
- 如果用户要接入程序，返回解析接口和示例请求体
- 回答保持直接、可执行
