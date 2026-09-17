---
layout: home
hero:
  name: Flux Demo
  text: 主题示例站
  tagline: 一份虚构内容的 VitePress 博客，用来看主题长什么样
  actions:
    - theme: brand
      text: 看文章
      link: /posts/
    - theme: alt
      text: 关于这个站
      link: /about
features:
  - title: 只有文章
    details: 没有作品墙、没有 Now 月度留档、没有自定义组件——一个普通博客本来的样子。
  - title: 内容全是编的
    details: 这里的人、项目、数据都不存在。想看 Markdown 能写成什么样，直接翻
      《Markdown 全格式总览》那篇。
  - title: 两套约定分开
    details: 主题约定（layout/pageClass/masthead）与内容约定（posts/ 与 frontmatter）互不依赖。
---

<script setup>
import { data as posts } from './posts/posts.data.ts'

// 首页只取最新五篇；列表页与归档页用的是同一份数据源
const latest = posts.slice(0, 5)
</script>

## 最新文章

<p v-if="!latest.length">暂无文章。</p>

<ul v-else class="post-list">
  <li v-for="post in latest" :key="post.url" class="post-item">
    <a class="post-entry" :href="post.url">
      <time v-if="post.date" class="post-date">{{ post.date }}</time>
      <span class="post-main">
        <span class="post-title">{{ post.title }}</span>
        <span v-if="post.description" class="post-desc">{{ post.description }}</span>
      </span>
    </a>
  </li>
</ul>

<p><a href="/archive">按时间翻全部 →</a></p>
