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

// 引言：优先显示一言，请求失败或还在加载时退回下面这句固定的，
// 不让这一行空着。SSR 阶段不跑 onMounted，输出的是这句兜底文案。
const HITOKOTO_FALLBACK = '人不能两次踏入同一条河，但我每个月给自己截张图，看看这回又漂到哪儿了。'

// 一言的分类：a 动画 b 漫画 c 游戏 d 文学 e 原创 f 来自网络 g 其他 h 影视
// i 诗词 j 网易云 k 哲学 l 抖机灵，十二类全取
const HITOKOTO_CATEGORIES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l']
// 多个分类要写成重复的 c= 参数，逗号分隔会被接口当成非法值
const HITOKOTO_URL = `https://v1.hitokoto.cn/?${HITOKOTO_CATEGORIES.map(c => `c=${c}`).join('&')}`
const hitokoto = ref('') // 完整句子
const hitokotoFrom = ref('') // 出处（作者 + 作品），没有就留空、整行不显示
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

// from 有时不是作品名，而是来源或字面的「原创」——这类不加书名号，免得出现《网络》《网易云热评》。
// 这类名字常带后缀（网易云 / 网易云热评），所以按关键词匹配；以后撞见别的平台名往这里加
const SOURCE_KEYWORDS = ['原创', '网络', 'B站', 'bilibili', '网易云']

// 组装出处：有作品就「作者《作品》」；只有来源就写来源，两者都有就用「 · 」隔开
function formatSource(data: { from?: string | null; from_who?: string | null }) {
  const from = data.from?.trim() ?? ''
  const who = data.from_who?.trim() ?? ''
  if (!from) return who
  const isWork = !SOURCE_KEYWORDS.some(k => from.includes(k))
  if (!who) return isWork ? `《${from}》` : from
  if (who === from) return who
  return isWork ? `${who}《${from}》` : `${who} · ${from}`
}

// 首次挂载取一句，之后点击「换一句」也走这里
async function loadHitokoto() {
  // 接口前面有 Cloudflare 边缘缓存，连点两下会拿到同一份响应，所以每次带个时间戳绕开它。
  // 绕开之后仍有概率随机到同一条（池子就这么大），撞上就再取一次，最多三跳
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const res = await fetch(`${HITOKOTO_URL}&_=${Date.now()}`)
      if (!res.ok) return
      const data = await res.json()
      const text = data?.hitokoto
      if (!text) return
      if (text === hitokoto.value) continue
      hitokotoFrom.value = formatSource(data)
      typewrite(text)
      return
    } catch {
      // 断网、跨域被拦或接口变动时保留当前文案（首次失败则显示兜底）
      return
    }
  }
}

onMounted(loadHitokoto)
</script>

# Now

<button type="button" class="now-lead" @click="loadHitokoto">
  <span class="now-lead-text" :class="{ 'is-typing': typing }">{{ leadText }}</span>
  <span v-if="!typing && hitokotoFrom" class="now-lead-from">—— {{ hitokotoFrom }}</span>
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
