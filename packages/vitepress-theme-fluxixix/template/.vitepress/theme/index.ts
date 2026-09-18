// 主题本体 + 样式总表。这里必须是**两次 import，而且顺序不能反**——
// 主题样式靠「排在 VitePress 默认主题之后」才压得住它（默认主题未分层，
// 未分层胜过任何命名层）。写反了品牌色、导航胶囊、进度环会一起失效，且不报错。
import { fluxixixTheme } from 'vitepress-theme-fluxixix'
import 'vitepress-theme-fluxixix/styles/index.css'

// 参数是「站点身份」：站名、标语、首页刊头的索引行、页脚链接。
// 不传的项走主题默认值（等于 fluxixix 本站的现值），所以第三方站点要显式覆盖。
export default fluxixixTheme({
  site: { name: '__SITE_NAME__', tagline: '__SITE_TAGLINE__' },
  home: {
    statement: '__SITE_STATEMENT__',
    rows: [
      { num: '01', label: '文章', meta: '技术笔记与零散思考', href: '/posts/' },
      { num: '02', label: '归档', meta: '按时间倒序，适合顺着翻', href: '/archive' },
      { num: '03', label: '关于', meta: '这个站和写它的人', href: '/about' }
    ]
  },
  footer: {
    links: [{ text: 'RSS', link: '/feed.xml' }]
  }
})

// 想要主题自带的那套排版（思源宋体 + IBM Plex Mono）：
//   npm i -D @fontsource/noto-serif-sc @fontsource/ibm-plex-mono
// 然后在上面第一行之前加一行 import 'vitepress-theme-fluxixix/fonts'
// 字体入口要求这两个包存在；不用它就不必装，页面回落到系统衬线/等宽字体。
