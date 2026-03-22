---
name: term2svg
description: 当你需要把终端文本、命令输出或终端会话转换为动画 SVG 时，使用这个技能。
---

# term2svg

这个技能用于处理 `tools.xcrong.me` 提供的 `term2svg` 能力。

## 何时使用

在以下场景中使用：

- 用户希望把终端文本转换为动画 SVG
- 用户需要 `term2svg` 的网页入口
- 用户需要 `term2svg` 的公开渲染 API

在以下场景中不要使用：

- 任务与终端动画生成无关
- 用户需要未公开的内部实现细节

## 公开入口

- 页面地址：`https://tools.xcrong.me/term2svg`
- API Base：`https://api.tools.xcrong.me`

## API

### 信息接口

- 方法：`GET`
- 地址：`https://api.tools.xcrong.me/api/term2svg`

### 渲染接口

- 方法：`POST`
- 地址：`https://api.tools.xcrong.me/api/term2svg/render`

请求体示例：

```json
{
  "content": "$ npm run dev\nready in 300ms",
  "theme": "tokyo",
  "speed": "normal",
  "prompt": "~",
  "width": 800,
  "maxHeight": 480
}
```

## 使用规则

- 用户只是手动生成动画时，优先引导到网页
- 用户需要自动化时，优先返回渲染接口
- 严格使用公开文档里的字段名
- 不要臆造额外参数

## 输出建议

- 如果用户要在线生成终端动画，返回页面地址
- 如果用户要集成到程序里，返回渲染接口和请求体示例
- 回答保持简洁、具体、可执行
