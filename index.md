---
layout: home

hero:
  name: "fluxixix"
  text: "less is more"
  tagline: may the force be with u
  actions:
    - theme: brand
      text: 阅读文章
      link: /posts/
    - theme: alt
      text: GitHub
      link: https://github.com/fluxixix/fluxixix.github.io

features:
  - icon: '✍️'
    title: 文章
    details: 记录学习笔记与零散思考，持续更新。
    link: /posts/
    linkText: 查看全部
  - icon: '🚀'
    title: 项目
    details: 做过和在做的东西，另附日常在用的技术栈。
    link: /projects
    linkText: 查看详情
  - icon: '🗂️'
    title: 归档
    details: 按时间倒序浏览全部文章，适合顺着翻。
    link: /archive
    linkText: 查看归档
  - icon: '🌱'
    title: Now
    details: 最近在做、在学、在看的东西，更新不勤但保证真实。
    link: /now
    linkText: 查看近况
---

<script setup>
import { data as posts } from './posts/posts.data.ts'
</script>

## 最新文章

<ul v-if="posts.length">
  <li v-for="post in posts.slice(0, 5)" :key="post.url">
    <a :href="post.url">{{ post.title }}</a>
    <span v-if="post.date"> · {{ post.date }}</span>
  </li>
</ul>
<p v-else>暂无文章。</p>
