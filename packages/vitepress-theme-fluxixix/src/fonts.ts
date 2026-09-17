/**
 * 字体入口：主题本身不引字体，只声明字体栈（见 styles/tokens.css）——
 * 未装字体的站点会落到系统衬线/等宽字体，页面依然正常。
 *
 * 需要主题自带的那套排版时，在站点的主题入口顶部引入本模块：
 *
 *   import 'vitepress-theme-fluxixix/fonts'
 *
 * 依赖（可选 peer，缺省不影响构建）：
 *   @fontsource/noto-serif-sc  @fontsource/ibm-plex-mono
 */
// 中文宋体按 unicode-range 切片，浏览器只下载页面用字的切片。
// 它同时承接拉丁展示字——所以这里只引这一个衬线字体，不再有拉丁展示字体。
import '@fontsource/noto-serif-sc/700.css'
import '@fontsource/ibm-plex-mono/400.css'
import '@fontsource/ibm-plex-mono/500.css'
