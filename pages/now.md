---
title: Now
pageClass: now-index
---

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
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

// 引言：优先显示一言（抖机灵），请求失败或还在加载时退回下面这句固定的，
// 不让这一行空着。SSR 阶段不跑 onMounted，输出的是这句兜底文案。
const HITOKOTO_FALLBACK = '人不能两次踏入同一条河，但我每个月给自己截张图，看看这回又漂到哪儿了。'
const hitokoto = ref('') // 完整句子
const typed = ref(0) // 打字机已打出的字数
const typing = ref(false) // 是否在打字（控制光标）

// 打字中逐字切片，非打字时给完整句；还没取到一言时给兜底
const leadText = computed(() => {
  if (typing.value) return hitokoto.value.slice(0, typed.value)
  return hitokoto.value || HITOKOTO_FALLBACK
})

let typeTimer = 0

// 把一句完整的话逐字打出来；用户系统开了「减少动效」就直接整句显示
function typewrite(text: string) {
  clearInterval(typeTimer)
  hitokoto.value = text
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    typed.value = text.length
    typing.value = false
    return
  }
  typed.value = 0
  typing.value = true
  let i = 0
  typeTimer = window.setInterval(() => {
    i += 1
    typed.value = i
    if (i >= text.length) {
      clearInterval(typeTimer)
      typing.value = false
    }
  }, 45)
}

// 首次挂载取一句，之后点击「换一句」也走这里
async function loadHitokoto() {
  try {
    const res = await fetch('https://v1.hitokoto.cn/?c=l')
    if (!res.ok) return
    const data = await res.json()
    if (data?.hitokoto) typewrite(data.hitokoto)
  } catch {
    // 断网、跨域被拦或接口变动时保留当前文案（首次失败则显示兜底）
  }
}

onMounted(loadHitokoto)
</script>

# Now

<button type="button" class="now-lead" @click="loadHitokoto">
  <span class="now-lead-text" :class="{ 'is-typing': typing }">{{ leadText }}</span>
</button>

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
