<script setup>
import { computed } from 'vue'
import { useData } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import NowHeader from './now/NowHeader.vue'
import PageMasthead from './head/PageMasthead.vue'

const { frontmatter } = useData()
/** 由 pages/now/YYYY-MM.md 的 frontmatter 决定是否渲染 Now 页头 */
const isNow = computed(() => frontmatter.value.now === true)
/** 编辑体页头（关于页、项目页）：页面自己在 frontmatter 里声明 masthead: true */
const hasMasthead = computed(() => frontmatter.value.masthead === true)
</script>

<template>
  <DefaultTheme.Layout>
    <!-- doc-before 落在 .content-container 内、.vp-doc 之前：宽度与正文列一致 -->
    <template #doc-before>
      <NowHeader v-if="isNow" />
      <PageMasthead v-if="hasMasthead" />
    </template>
  </DefaultTheme.Layout>
</template>
