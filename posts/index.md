---
title: 文章
---

<script setup>
import { data as posts } from './posts.data.ts'
</script>

# 文章

<p v-if="!posts.length">暂无文章。</p>
<ul v-else>
  <li v-for="post in posts" :key="post.url">
    <a :href="post.url">{{ post.title }}</a>
    <span v-if="post.date"> · {{ post.date }}</span>
  </li>
</ul>
