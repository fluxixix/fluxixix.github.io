<script setup>
import { computed } from 'vue'
import { useData } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import NowHeader from './now/NowHeader.vue'
import AboutHeader from './about/AboutHeader.vue'

const { frontmatter } = useData()
/** 由 pages/now/YYYY-MM.md 的 frontmatter 决定是否渲染 Now 页头 */
const isNow = computed(() => frontmatter.value.now === true)
/** 由 pages/about.md 的 frontmatter 决定是否渲染关于页页头 */
const isAbout = computed(() => frontmatter.value.about === true)
</script>

<template>
  <DefaultTheme.Layout>
    <!-- doc-before 落在 .content-container 内、.vp-doc 之前：宽度与正文列一致 -->
    <template #doc-before>
      <NowHeader v-if="isNow" />
      <AboutHeader v-if="isAbout" />
    </template>
  </DefaultTheme.Layout>
</template>
