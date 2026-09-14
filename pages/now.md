---
title: Now
pageClass: now-index
---

<script setup>
import { data as entries } from './now/now.data.ts'

// 按年份分组：month 形如 2026-09，切出前四位即可；分组顺序跟着 entries 的倒序
const groups = []
for (const entry of entries) {
  const year = entry.month.slice(0, 4)
  let group = groups.find((item) => item.year === year)
  if (!group) {
    group = { year, entries: [] }
    groups.push(group)
  }
  group.entries.push(entry)
}
</script>

# Now

人不能两次踏入同一条河，但我每个月给自己截张图，看看这回又漂到哪儿了。

<div v-if="!entries.length" class="now-empty">还没有留档。</div>

<div v-else class="now-index">
  <section v-for="group in groups" :key="group.year" class="now-year">
    <h2 class="now-year-head">
      <span class="now-year-num">{{ group.year }}</span>
      <span class="now-year-count">{{ group.entries.length }} 期</span>
    </h2>
    <ul class="now-list">
      <li v-for="entry in group.entries" :key="entry.url" class="now-item">
        <a
          class="now-entry"
          :class="{ 'is-current': entry === entries[0] }"
          :href="entry.url"
          :aria-label="entry === entries[0] ? `${entry.title}（当前）` : entry.title"
        >
          <time class="now-num" :datetime="entry.month">{{ entry.month.slice(5) }}</time>
          <span class="now-line">{{ entry.line }}</span>
          <span v-if="entry === entries[0]" class="now-current">当前</span>
        </a>
      </li>
    </ul>
  </section>
</div>

<p class="now-note">与其维护一份永远滞后的自我介绍，不如留一张诚实的当下快照。</p>
