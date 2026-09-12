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
  - icon: '🧰'
    title: 技术栈
    details:
      - 待补充：常用语言
      - 待补充：框架与库
      - 待补充：开发工具
  - icon: '🚀'
    title: 精选项目
    details:
      - 待补充：项目名称 —— 一句话说明
      - 待补充：项目名称 —— 一句话说明
  - icon: '📮'
    title: 联系
    details: 待补充：邮箱等联系方式
---

<script setup>
import { data as posts } from './posts/posts.data.ts'
</script>

## 关于我

<!-- 把下面这段替换成你自己的介绍：目前在做什么、关注哪些方向、为什么写这个博客 -->
这里是占位文字。请替换为个人介绍——你现在的工作或研究方向、感兴趣的技术话题，以及建立这个站点想记录什么。

## 最新文章

<ul v-if="posts.length">
  <li v-for="post in posts.slice(0, 5)" :key="post.url">
    <a :href="post.url">{{ post.title }}</a>
    <span v-if="post.date"> · {{ post.date }}</span>
  </li>
</ul>
<p v-else>暂无文章。</p>
