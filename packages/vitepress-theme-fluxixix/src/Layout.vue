<script setup lang="ts">
import { computed } from 'vue'
import { useData } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import NowHeader from './components/NowHeader.vue'
import PageMasthead from './components/PageMasthead.vue'
import HomeCover from './components/HomeCover.vue'
import SiteFooter from './components/SiteFooter.vue'

const { frontmatter } = useData()
/** 由 Now 月度页 frontmatter 决定是否渲染 Now 页头 */
const isNow = computed(() => frontmatter.value.now === true)
/** 编辑体页头（关于页、项目页）：页面自己在 frontmatter 里声明 masthead: true */
const hasMasthead = computed(() => frontmatter.value.masthead === true)
</script>

<template>
  <DefaultTheme.Layout>
    <!-- 首页刊头：home-hero-before 在移除 hero frontmatter 后仍是 VPHome 的第一个子节点，
         自带容器宽度，样式在 styles/home.css -->
    <template #home-hero-before>
      <HomeCover />
    </template>

    <!-- doc-before 落在 .content-container 内、.vp-doc 之前：宽度与正文列一致 -->
    <template #doc-before>
      <NowHeader v-if="isNow" />
      <PageMasthead v-if="hasMasthead" />
    </template>

    <!-- 全站页脚：刊物的「版权页」 -->
    <template #layout-bottom>
      <SiteFooter />
    </template>
  </DefaultTheme.Layout>
</template>
