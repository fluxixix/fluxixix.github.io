<script setup lang="ts">
// 刊物的版权页：一行等宽小字，左侧署名与年份，右侧只放两个真有人点的链接。
// layout-bottom 插槽在正文容器之外，宽度要自己收。
const year = new Date().getFullYear()
</script>

<template>
  <footer class="site-footer">
    <div class="site-footer-inner">
      <p class="site-footer-meta">fluxixix · less is more · {{ year }}</p>
      <nav class="site-footer-links" aria-label="站点链接">
        <a href="/feed.xml">RSS</a>
        <a href="https://github.com/fluxixix/fluxixix.github.io">GitHub</a>
      </nav>
    </div>
  </footer>
</template>
