<script setup lang="ts">
import { inject } from 'vue'
import { OPTIONS_KEY, type ResolvedFluxixixOptions } from '../options'

// 首页刊头：站名、标语、陈述句与四条索引都来自站点参数（options.ts），
// 组件里不再有站点专属字面量。
// 行的进场动画在 styles/home.css（自跑 keyframe + nth-child 错开），
// 不依赖滚动脚本，后台标签页打开也不会一直藏着。
const options = inject(OPTIONS_KEY) as ResolvedFluxixixOptions
</script>

<template>
  <section class="home-cover">
    <p class="home-cover-kicker">
      <span>{{ options.site.name }}</span>
      <span>{{ options.site.tagline }}</span>
    </p>
    <!-- 陈述句两侧各留一个空格是设计的一部分（迁移前由模板换行产生）。
         Vue 会吃掉换行两侧的空白，所以这里把空格写进表达式本身。 -->
    <h1 class="home-cover-statement" lang="en">{{ ` ${options.home.statement} ` }}</h1>
    <nav class="home-index" aria-label="站点索引">
      <a
        v-for="row in options.home.rows"
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
