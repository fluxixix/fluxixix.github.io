<script setup lang="ts">
// 首页刊头：四条索引几乎不变，直接写在组件里；文案变动只改这一处。
// 行的进场动画在 custom.css 第 3 节（自跑 keyframe + nth-child 错开），
// 不依赖滚动脚本，后台标签页打开也不会一直藏着。
const rows = [
  { num: '01', label: '文章', meta: '技术笔记与零散思考', href: '/posts/' },
  { num: '02', label: '作品', meta: '平台 · 工具链 · 个人项目', href: '/works' },
  { num: '03', label: 'Now', meta: '最近在做、在学、在玩的', href: '/now' },
  { num: '04', label: '归档', meta: '按时间倒序，适合顺着翻', href: '/archive' }
]
</script>

<template>
  <section class="home-cover">
    <p class="home-cover-kicker">
      <span>fluxixix</span>
      <span>less is more</span>
    </p>
    <h1 class="home-cover-statement" lang="en">
      harder / better / faster / stronger
    </h1>
    <nav class="home-index" aria-label="站点索引">
      <a
        v-for="row in rows"
        :key="row.href"
        class="home-index-row"
        :href="row.href"
      >
        <span class="home-index-num">{{ row.num }}</span>
        <span class="home-index-label">{{ row.label }}</span>
        <span class="home-index-meta">{{ row.meta }}</span>
        <span class="home-index-arrow" aria-hidden="true">→</span>
      </a>
    </nav>
  </section>
</template>
