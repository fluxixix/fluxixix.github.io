<script setup>
import { computed } from 'vue'
import { useData } from 'vitepress'

// 页头完全由 frontmatter 生成：名字、标签、身份行在页面里写一次，正文就不再重复。
// 关于页与项目页共用这一个组件——两页是同一套编辑体排版，页头也是同一件东西，
// 差别只在文案（tag / meta 都从 frontmatter 来，组件里不写死任何一页的词）。
const { frontmatter } = useData()

const name = computed(() => String(frontmatter.value.name ?? ''))
const tag = computed(() => String(frontmatter.value.tag ?? ''))
const meta = computed(() => String(frontmatter.value.meta ?? ''))
</script>

<template>
  <!-- 用 div 而不是 header：这个位置在 <main> 之外，header 会变成第二个 banner
       landmark（站点导航已经有一个），页面级语义由下面的 h1 承担 -->
  <div v-if="name" class="masthead">
    <!-- 这一页没有别的 h1：名字就是页面标题，读屏按标题跳转时不会直接落到第一节 -->
    <h1 class="masthead-name">{{ name }}</h1>
    <p v-if="tag" class="masthead-tag">{{ tag }}</p>
    <div class="masthead-rule" />
    <p v-if="meta" class="masthead-meta">{{ meta }}</p>
  </div>
</template>
