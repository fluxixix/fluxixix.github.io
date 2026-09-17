<script setup lang="ts">
import { computed, inject } from 'vue'
import { OPTIONS_KEY, type ResolvedFluxixixOptions } from '../options'

// 刊物的版权页：一行等宽小字，左侧署名与年份，右侧只放几个真有人点的链接。
// 署名与链接都来自站点参数（options.ts）。
//
// 链接为什么用 v-html 拼：v-for 会让 Vue 在列表两端各插一个片段标记
// （<!--[--><!--]-->），静态写法则不会。首屏 HTML 与迁移前逐字一致是这次抽包
// 的红线，所以这里自己拼字符串——内容会被转义，且 footer.links 与 nav、
// sidebar 同属站点自己的配置，信任级别一致。
// layout-bottom 插槽在正文容器之外，宽度要自己收。
const options = inject(OPTIONS_KEY) as ResolvedFluxixixOptions
const year = new Date().getFullYear()

/** 只转义会破坏标签结构的四个字符，够用且不改变 URL 本身 */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

const linksHtml = computed(() =>
  options.footer.links
    .map((link) => `<a href="${escapeHtml(link.link)}">${escapeHtml(link.text)}</a>`)
    .join('')
)
</script>

<template>
  <footer class="site-footer">
    <div class="site-footer-inner">
      <p class="site-footer-meta">{{ options.footer.meta }} · {{ year }}</p>
      <!-- eslint-disable-next-line vue/no-v-html -->
      <nav class="site-footer-links" aria-label="站点链接" v-html="linksHtml" />
    </div>
  </footer>
</template>
