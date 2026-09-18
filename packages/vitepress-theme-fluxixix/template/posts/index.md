---
title: 文章
# 列表页不在侧边栏条目里，prev/next 会误取到侧边栏第一项，关掉页脚导航
prev: false
next: false
---

<script setup>
import { data as posts } from './posts.data.ts'
</script>

# 文章

<p v-if="!posts.length">暂无文章。</p>

<ul v-else class="post-list">
  <li v-for="post in posts" :key="post.url" class="post-item">
    <a class="post-entry" :href="post.url">
      <time v-if="post.date" class="post-date">{{ post.date }}</time>
      <span class="post-main">
        <span class="post-title">{{ post.title }}</span>
        <span v-if="post.description" class="post-desc">{{ post.description }}</span>
      </span>
    </a>
  </li>
</ul>
