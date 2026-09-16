---
layout: home
---

<script setup>
import { data as posts } from './posts/posts.data.ts'
</script>

## 最新文章

<p v-if="!posts.length">暂无文章。</p>

<ul v-else class="post-list">
  <li v-for="post in posts.slice(0, 5)" :key="post.url" class="post-item">
    <a class="post-entry" :href="post.url">
      <time v-if="post.date" class="post-date">{{ post.date }}</time>
      <span class="post-main">
        <span class="post-title">{{ post.title }}</span>
        <span v-if="post.description" class="post-desc">{{ post.description }}</span>
      </span>
    </a>
  </li>
</ul>
