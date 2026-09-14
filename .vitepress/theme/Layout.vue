<script setup>
import { computed } from 'vue'
import { useData } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import NowHeader from './now/NowHeader.vue'

const { frontmatter } = useData()
/** 由 pages/now/YYYY-MM.md 的 frontmatter 决定是否渲染 Now 页头 */
const isNow = computed(() => frontmatter.value.now === true)
</script>

<template>
  <DefaultTheme.Layout>
    <!-- doc-before 落在 .content-container 内、.vp-doc 之前：宽度与正文列一致 -->
    <template #doc-before>
      <NowHeader v-if="isNow" />
    </template>
  </DefaultTheme.Layout>
</template>
