export const DOUBAO_API_URL =
  'https://www.doubao.com/creativity/share/get_video_share_info?' +
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
    web_tab_id: '',
  }).toString()

export const API_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
    '(KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36 NetType/WIFI ' +
    'MicroMessenger/7.0.20.1781(0x6700143B) WindowsWechat(0x63090c33) ' +
    'XWEB/14315 Flue',
  Origin: 'https://www.doubao.com',
  'Content-Type': 'application/json',
}

export const VIDEO_USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'
