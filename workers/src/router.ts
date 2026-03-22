export function normalizePath(url: URL): string {
  return url.pathname.replace(/\/+$/, '') || '/'
}
