import { json, type RequestHandler } from '@sveltejs/kit';

interface ApiResponse {
	code: number;
	msg?: string;
	data?: VideoData;
}

interface VideoData {
	play_info: PlayInfo;
	user_info?: UserInfo;
	prompt?: string;
}

interface PlayInfo {
	main: string;
	backup?: string;
	width: number;
	height: number;
	definition: string;
	poster_url?: string;
}

interface UserInfo {
	user_id?: number;
	nickname?: string;
}

interface RequestBody {
	share_id: string;
	vid: string;
	creation_id: string;
}

// 从分享链接提取参数
function extractParams(shareUrl: string): { shareId: string; videoId: string } {
	const url = new URL(shareUrl);
	const params = new URLSearchParams(url.search);

	const shareId = params.get('share_id');
	const videoId = params.get('video_id');

	if (!shareId || !videoId) {
		throw new Error('链接中缺少必要的参数 share_id 或 video_id');
	}

	return { shareId, videoId };
}

export const POST: RequestHandler = async ({ request }) => {
	try {
		const { shareUrl } = await request.json();

		if (!shareUrl) {
			return json({ error: '请提供分享链接' }, { status: 400 });
		}

		// 提取参数
		const { shareId, videoId } = extractParams(shareUrl);

		// 构建 API 请求
		const apiUrl = 'https://www.doubao.com/creativity/share/get_video_share_info?' +
			new URLSearchParams({
				version_code: '20800',
				language: 'zh-CN',
				device_platform: 'web',
				aid: '497858',
				real_aid: '497858',
				pkg_type: 'release_version',
				device_id: '',
				pc_version: '2.51.7',
				region: '',
				sys_region: '',
				samantha_web: '1',
				'use-olympus-account': '1',
				web_tab_id: ''
			}).toString();

		const headers = {
			'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36 NetType/WIFI MicroMessenger/7.0.20.1781(0x6700143B) WindowsWechat(0x63090c33) XWEB/14315 Flue',
			'Origin': 'https://www.doubao.com',
			'Content-Type': 'application/json'
		};

		const body: RequestBody = {
			share_id: shareId,
			vid: videoId,
			creation_id: ''
		};

		// 调用豆包 API
		const response = await fetch(apiUrl, {
			method: 'POST',
			headers,
			body: JSON.stringify(body)
		});

		if (!response.ok) {
			return json({ error: `API 请求失败：${response.status}` }, { status: 500 });
		}

		const result: ApiResponse = await response.json();

		if (result.code !== 0) {
			return json({ error: `API 错误：${result.msg || '未知错误'}` }, { status: 500 });
		}

		if (!result.data) {
			return json({ error: '响应中缺少视频数据' }, { status: 500 });
		}

		return json({
			shareId,
			videoId,
			...result.data
		});

	} catch (error) {
		console.error('豆包视频解析错误:', error);
		return json({ error: error instanceof Error ? error.message : '未知错误' }, { status: 500 });
	}
};
