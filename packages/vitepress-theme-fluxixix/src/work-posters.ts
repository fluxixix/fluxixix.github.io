import { onContentUpdated } from 'vitepress'
import type { ResolvedFluxixixOptions } from './options'

/* --------------------------------------------------------------------------
   作品墙的展开：卡面尺寸固定，点一下就地摊开
   -------------------------------------------------------------------------- */

/**
 * 可折叠卡片：卡面尺寸固定，正文裁在卡里，点展开键就地摊开看全部详情。
 * 作品页的九张海报卡与关于页的两张经历卡共用这一套（都是 .work-poster + .poster-toggle）。
 *
 * 高度要从具体值过渡到 auto，而 auto 不能插值，所以展开前先量一次「完全摊开」
 * 的高度——临时摘掉所有过渡、把卡面放开，量完立刻还原——再拿它当过渡终点；
 * 过渡结束后把内联高度交还给 auto，窗口缩放时卡片还能自己适应。收起的终点从
 * --fx-poster-h 读，不写第二份常量。
 *
 * dataset 挡一道重复绑定：onContentUpdated 在水合前后各跑一次，卡片可能是同一批 DOM。
 */
export function setupWorkPosters(options: ResolvedFluxixixOptions) {
  if (typeof window === 'undefined') return

  const collapseLabel = options.i18n.collapse

  const bind = () => {
    const cards = document.querySelectorAll<HTMLElement>('.work-poster')

    for (const card of cards) {
      if (card.dataset.fxBound === '1') continue
      const toggle = card.querySelector<HTMLButtonElement>('.poster-toggle')
      if (!toggle) continue
      card.dataset.fxBound = '1'

      // 收起态的文案存在 dataset 里，展开时换成「收起」，收回来再贴回去
      const label = toggle.querySelector('span')
      if (label && !label.dataset.fxClosed) {
        label.dataset.fxClosed = label.textContent ?? ''
      }

      toggle.addEventListener('click', () => {
        const opening = !card.classList.contains('is-open')
        const from = card.offsetHeight
        const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16
        // 收起前记下展开键的视口位置，收起来时要把它按回原处（见下面 pin）
        const anchor = toggle.getBoundingClientRect().top

        // 起点先钉住：从 auto 起跳浏览器不过渡
        card.style.height = `${from}px`

        if (opening) {
          card.classList.add('is-measuring', 'is-open')
          card.style.height = 'auto'
          const full = card.offsetHeight
          card.classList.remove('is-measuring', 'is-open')
          card.style.height = `${from}px`
          void card.offsetHeight
          card.classList.add('is-open')
          card.style.height = `${full}px`
        } else {
          const fixed =
            parseFloat(getComputedStyle(card).getPropertyValue('--fx-poster-h')) || 33
          void card.offsetHeight
          card.style.height = `${fixed * rem}px`
          card.classList.remove('is-open')

          // 卡片一口气矮掉上千像素，浏览器不会替你保住参照物：视口不动的话，
          // 指头底下那个键会瞬间飞出屏幕，整页像被拽去看下面一段。
          // 于是过渡期间每帧把它按回原处——看着就是卡片向上收、键留在原处。
          // 逐帧量的是当前误差，不预设时长，所以和缓动曲线天然同步
          const until = performance.now() + 480
          const pin = () => {
            const delta = toggle.getBoundingClientRect().top - anchor
            if (delta) window.scrollBy(0, delta)
            if (performance.now() < until) requestAnimationFrame(pin)
          }
          requestAnimationFrame(pin)
        }

        if (label) {
          label.textContent = opening ? collapseLabel : label.dataset.fxClosed ?? ''
        }
        toggle.setAttribute('aria-expanded', String(opening))

        const settle = (event: TransitionEvent) => {
          if (event.propertyName !== 'height') return
          card.style.height = ''
          card.removeEventListener('transitionend', settle)
        }
        card.addEventListener('transitionend', settle)
      })
    }
  }

  onContentUpdated(() => {
    bind()
    requestAnimationFrame(bind)
  })
}
