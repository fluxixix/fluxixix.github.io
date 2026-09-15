<script setup>
import { computed } from 'vue'
import { useData } from 'vitepress'

// 页头完全由 frontmatter 生成：名字、身份行、标签都在 pages/about.md 里写一次，
// 正文里就不用再重复一遍。与 Now 页的 NowHeader 同构（那个页头也只读 frontmatter）
const { frontmatter } = useData()

const name = computed(() => String(frontmatter.value.name ?? ''))
const meta = computed(() => String(frontmatter.value.meta ?? ''))
</script>

<template>
  <!-- 用 div 而不是 header：这个位置在 <main> 之外，header 会变成第二个 banner
       landmark（站点导航已经有一个），页面级语义由下面的 h1 承担 -->
  <div v-if="name" class="about-head">
    <!-- 这一页没有别的 h1：名字就是页面标题，读屏按标题跳转时不会直接落到「现在」 -->
    <h1 class="about-head-name">{{ name }}</h1>
    <p class="about-head-tag">关于 · ABOUT</p>
    <div class="about-head-rule" />
    <p v-if="meta" class="about-head-meta">{{ meta }}</p>
  </div>
</template>
