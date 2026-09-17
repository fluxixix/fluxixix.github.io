<script setup lang="ts">
/**
 * 作品版画：把 zine 海报那套美学搬进页面——竖版纸面、大面积留白、
 * 一个小小的高饱和色锚点、脚边一行等宽微文字——但用内联 SVG 画。
 * 没有位图、不依赖生图通道，纸色与墨色都吃 CSS 变量，明暗主题自动跟随。
 *
 * 每件作品只挑一个母题（variant），锚点只用一个色相（tone）：
 * 整页看下来是一套版画，而不是九张插图。
 */
withDefaults(
  defineProps<{
    /** 图形母题 */
    variant:
      | 'nodes'
      | 'cloud'
      | 'tracks'
      | 'grid'
      | 'stack'
      | 'pulse'
      | 'blocks'
      | 'frame'
    /** 纸面上那唯一一个高饱和色锚点 */
    tone?: 'violet' | 'cyan'
    /** 角落的编号，与页首作品索引同号 */
    code?: string
    /** 脚边一行微文字 */
    note?: string
    /** 给读屏用的一句话说明 */
    label?: string
  }>(),
  { tone: 'violet', code: '', note: '', label: '' }
)
</script>

<template>
  <figure class="work-plate" :class="`is-${tone}`">
    <svg viewBox="0 0 120 200" role="img" :aria-label="label || undefined">
      <rect class="plate-paper" x="0.5" y="0.5" width="119" height="199" rx="2" />

      <!-- 节点网络：一个平台里的东西怎么互相挂上 -->
      <g v-if="variant === 'nodes'" class="plate-subject">
        <path
          class="plate-wire"
          d="M28 74 L60 54 M60 54 L92 78 M28 74 L42 104 M42 104 L60 126 M92 78 L78 108 M78 108 L60 126 M60 54 L78 108 M42 104 L28 74"
        />
        <circle class="plate-dot" cx="28" cy="74" r="2.6" />
        <circle class="plate-dot" cx="92" cy="78" r="2.6" />
        <circle class="plate-dot" cx="42" cy="104" r="2.2" />
        <circle class="plate-dot" cx="78" cy="108" r="2.2" />
        <circle class="plate-dot" cx="60" cy="126" r="2" />
        <circle class="plate-anchor" cx="60" cy="54" r="5.2" />
      </g>

      <!-- 点云：目标散在空间里，只有一个是确定的 -->
      <g v-else-if="variant === 'cloud'" class="plate-subject">
        <circle class="plate-dot" cx="22" cy="66" r="1.5" />
        <circle class="plate-dot" cx="31" cy="58" r="1.2" />
        <circle class="plate-dot" cx="40" cy="70" r="1.6" />
        <circle class="plate-dot" cx="49" cy="60" r="1.1" />
        <circle class="plate-dot" cx="57" cy="72" r="1.5" />
        <circle class="plate-dot" cx="66" cy="62" r="1.3" />
        <circle class="plate-dot" cx="74" cy="74" r="1.6" />
        <circle class="plate-dot" cx="83" cy="64" r="1.2" />
        <circle class="plate-dot" cx="92" cy="76" r="1.5" />
        <circle class="plate-dot" cx="27" cy="84" r="1.3" />
        <circle class="plate-dot" cx="36" cy="92" r="1.5" />
        <circle class="plate-dot" cx="45" cy="82" r="1.2" />
        <circle class="plate-dot" cx="54" cy="94" r="1.6" />
        <circle class="plate-dot" cx="63" cy="84" r="1.2" />
        <circle class="plate-dot" cx="72" cy="96" r="1.5" />
        <circle class="plate-dot" cx="81" cy="86" r="1.3" />
        <circle class="plate-dot" cx="90" cy="98" r="1.4" />
        <circle class="plate-dot" cx="33" cy="110" r="1.2" />
        <circle class="plate-dot" cx="51" cy="112" r="1.4" />
        <circle class="plate-dot" cx="69" cy="114" r="1.2" />
        <circle class="plate-dot" cx="87" cy="110" r="1.3" />
        <circle class="plate-anchor" cx="60" cy="88" r="4.6" />
      </g>

      <!-- 轨道：几路数据挂在同一条时间轴上 -->
      <g v-else-if="variant === 'tracks'" class="plate-subject">
        <path class="plate-wire" d="M18 74 H102 M18 96 H102 M18 118 H102" />
        <path
          class="plate-trace"
          d="M18 118 C30 118 32 96 44 96 C56 96 58 74 70 74 C82 74 84 96 96 96"
        />
        <circle class="plate-dot" cx="18" cy="74" r="2" />
        <circle class="plate-dot" cx="18" cy="96" r="2" />
        <circle class="plate-anchor" cx="70" cy="74" r="4.6" />
      </g>

      <!-- 面板网格：十几个视图盯着同一段时间 -->
      <g v-else-if="variant === 'grid'" class="plate-subject">
        <rect class="plate-box" x="24" y="56" width="22" height="16" />
        <rect class="plate-box" x="49" y="56" width="22" height="16" />
        <rect class="plate-box" x="74" y="56" width="22" height="16" />
        <rect class="plate-box" x="24" y="76" width="22" height="16" />
        <rect class="plate-box" x="49" y="76" width="22" height="16" />
        <rect class="plate-box" x="24" y="96" width="22" height="16" />
        <rect class="plate-box" x="49" y="96" width="22" height="16" />
        <rect class="plate-box" x="74" y="96" width="22" height="16" />
        <rect class="plate-anchor-block" x="74" y="76" width="22" height="16" />
      </g>

      <!-- 层叠：各种格式进同一个入口 -->
      <g v-else-if="variant === 'stack'" class="plate-subject">
        <rect class="plate-box" x="26" y="62" width="68" height="12" rx="1" />
        <rect class="plate-box" x="22" y="80" width="68" height="12" rx="1" />
        <rect class="plate-box" x="30" y="98" width="68" height="12" rx="1" />
        <rect class="plate-anchor-block" x="26" y="116" width="68" height="12" rx="1" />
      </g>

      <!-- 脉冲：一条诊断链路里的一次会话 -->
      <g v-else-if="variant === 'pulse'" class="plate-subject">
        <path
          class="plate-wire"
          d="M18 94 H32 V70 H44 V114 H56 V94 H68 V78 H102"
        />
        <circle class="plate-anchor" cx="44" cy="70" r="4.4" />
      </g>

      <!-- 积木：装上一块就能解析一种格式 -->
      <g v-else-if="variant === 'blocks'" class="plate-subject">
        <path class="plate-wire" d="M44 72 H76 M60 82 V90" />
        <rect class="plate-box" x="24" y="62" width="20" height="20" rx="2" />
        <rect class="plate-box" x="76" y="62" width="20" height="20" rx="2" />
        <rect class="plate-anchor-block" x="50" y="90" width="20" height="20" rx="2" />
      </g>

      <!-- 页面框架：栏目、栏线、一块内容 -->
      <g v-else class="plate-subject">
        <rect class="plate-box" x="22" y="56" width="76" height="58" rx="2" />
        <path class="plate-wire" d="M22 70 H98" />
        <rect class="plate-box" x="30" y="78" width="26" height="6" rx="1" />
        <rect class="plate-box" x="30" y="92" width="52" height="6" rx="1" />
        <rect class="plate-anchor-block" x="64" y="78" width="26" height="20" rx="1" />
      </g>

      <text v-if="code" class="plate-code" x="10" y="22">{{ code }}</text>
      <line class="plate-rule" x1="10" y1="180" x2="34" y2="180" />
      <text v-if="note" class="plate-note" x="10" y="192">{{ note }}</text>
    </svg>
  </figure>
</template>
