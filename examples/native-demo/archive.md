---
title: 归档
---

<script setup>
import { data as posts } from './posts/posts.data.ts'

// 按年份分组，同时把日期拆成「年」和「月-日」两段，年份做标题、月日做行首标记
const groups = []
for (const post of posts) {
  const year = post.date ? post.date.slice(0, 4) : '未标注日期'
  let group = groups.find((item) => item.year === year)
  if (!group) {
    group = { year, posts: [] }
    groups.push(group)
  }
  group.posts.push({
    url: post.url,
    title: post.title,
    day: post.date ? post.date.slice(5) : ''
  })
}
</script>

# 归档

<p v-if="!posts.length">暂无文章。</p>

<div v-else class="archive-timeline">
  <section v-for="group in groups" :key="group.year" class="timeline-year">
    <header class="timeline-year-head">
      <h2 class="timeline-year-text">{{ group.year }}</h2>
    </header>
    <ul class="timeline-list">
      <li v-for="post in group.posts" :key="post.url" class="timeline-item">
        <a class="timeline-entry" :href="post.url">
          <time v-if="post.day" class="timeline-day">{{ post.day }}</time>
          <span class="timeline-title">{{ post.title }}</span>
        </a>
      </li>
    </ul>
  </section>
</div>
