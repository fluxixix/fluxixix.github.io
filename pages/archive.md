---
title: 归档
---

<script setup>
import { data as posts } from '../posts/posts.data.ts'

const groups = []
for (const post of posts) {
  const year = post.date ? post.date.slice(0, 4) : '未标注日期'
  const group = groups.find((item) => item.year === year)
  if (group) {
    group.posts.push(post)
  } else {
    groups.push({ year, posts: [post] })
  }
}
</script>

# 归档

<p v-if="!posts.length">暂无文章。</p>

<div v-for="group in groups" :key="group.year" class="archive-group">
  <h2>{{ group.year }}</h2>
  <ul>
    <li v-for="post in group.posts" :key="post.url">
      <a :href="post.url">{{ post.title }}</a>
      <span v-if="post.date"> · {{ post.date }}</span>
    </li>
  </ul>
</div>
