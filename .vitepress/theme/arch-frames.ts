/**
 * 作品页架构图 iframe 的挂载层。
 *
 * archify 产出的 HTML 认 ?theme=dark|light 参数（其次才是 localStorage 与
 * prefers-color-scheme）。作品页本身的明暗由 <html> 上的 .dark 类决定，两边
 * 并不同源，所以这里做两件事：
 *
 *   一、首次进作品页时，按站点当前主题给每个 iframe 补上 theme 参数；
 *   二、用户切换站点明暗时，同步换掉 iframe 的 theme（重载一次）。
 *
 * markdown 里写死的 src 不带 theme：没有 JS 时 iframe 照样能打开，只是跟随
 * 系统偏好，不依赖这一层。
 */
import { onContentUpdated } from 'vitepress'

function syncFrame(iframe: HTMLIFrameElement) {
  try {
    const url = new URL(iframe.getAttribute('src') ?? '', window.location.href)
    if (!url.pathname.startsWith('/arch/')) return
    url.searchParams.set('embed', '1')
    url.searchParams.set('theme', document.documentElement.classList.contains('dark') ? 'dark' : 'light')
    const next = url.pathname + url.search
    // 记下已经应用过的地址，避免 <html> 上任何无关 class 变动都触发重载
    if (iframe.dataset.archHref !== next) {
      iframe.dataset.archHref = next
      iframe.src = next
    }
  } catch {
    // src 不是合法 URL 时保持原样
  }
}

export function setupArchFrames() {
  if (typeof window === 'undefined') return

  const sync = () => {
    document.querySelectorAll<HTMLIFrameElement>('.arch-frame iframe').forEach(syncFrame)
  }

  onContentUpdated(() => requestAnimationFrame(sync))

  new MutationObserver(sync).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class']
  })
}
