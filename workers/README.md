# Tools Worker

统一的 Cloudflare Worker 项目，集中放网站需要的后端能力。
当前实现使用 TypeScript。

## 当前模块

- `doubao-video`
- `term2svg`

## 路由

### 根入口

- `GET /`

### 豆包视频

- `POST /api/doubao-video/parse`
- `GET /api/doubao-video/stream`
- `GET /api/doubao-video/download`

### term2svg

- `GET /api/term2svg`
- `POST /api/term2svg/render`

## term2svg 请求示例

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

## 本地调试

```bash
npx wrangler dev
```

## TypeScript 检查

```bash
npx tsc -p workers/tsconfig.json
```

## 部署

```bash
npx wrangler deploy
```

## 说明

- `workers/` 就是唯一的 Worker 项目根目录
- 网站前端继续独立部署
- 以后新增后端功能，优先放到 `workers/src/<module>/` 下面
