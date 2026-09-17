<script setup lang="ts">
import { computed, inject } from 'vue'
import { useData } from 'vitepress'
import { OPTIONS_KEY, type ResolvedFluxixixOptions } from '../options'

// 页头完全由 frontmatter 生成：月页正文里不写月份数字，也不用重复那句话
const { frontmatter } = useData()
const options = inject(OPTIONS_KEY) as ResolvedFluxixixOptions

const month = computed(() => String(frontmatter.value.month ?? ''))
const year = computed(() => month.value.slice(0, 4))
const monthNum = computed(() => month.value.slice(5))
const line = computed(() => frontmatter.value.line ?? '')
</script>

<template>
  <!-- 用 div 而不是 header：这个位置在 <main> 之外，header 会变成第二个 banner
       landmark（站点导航已经有一个），页面级语义由下面的 h1 承担 -->
  <div class="now-head">
    <!-- 这一页没有别的 h1：页头就是页面标题，语义与全站其它页面保持一致，
         读屏用户按标题跳转时不会直接落到「在做」 -->
    <h1 class="now-head-num">
      <span class="now-head-year">{{ year }}</span>
      <span class="now-head-month">{{ monthNum }}</span>
    </h1>
    <p class="now-head-tag">{{ options.i18n.nowTag }}</p>
    <div class="now-head-rule" />
    <p v-if="line" class="now-head-line">{{ line }}</p>
  </div>
</template>
