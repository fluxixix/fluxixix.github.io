---
title: 关于
pageClass: about
# 下面几个字段供 PageMasthead 生成页头，正文里不再重复写名字与身份行
masthead: true
name: fluxixix
tag: 关于 · ABOUT
meta: 工具链研发 · 玩AI · 广东
---

<script setup lang="ts">
import { ref } from 'vue'

// 联系我那一行把邮箱做成按钮：点一下复制到剪贴板，就地给个交代
const email = '944292511@qq.com'
const hint = ref('')

let hintTimer = 0

// 提示只停留 2s。连点要先清掉上一个定时器，否则上一次的定时器会把新提示提前抹掉
function flash(text: string) {
  clearTimeout(hintTimer)
  hint.value = text
  hintTimer = window.setTimeout(() => {
    hint.value = ''
  }, 2000)
}

async function copyEmail() {
  try {
    await navigator.clipboard.writeText(email)
    flash('已复制')
  } catch {
    // 剪贴板接口在非安全上下文或权限被拒时不可用：退回到「帮你选中」，
    // 比只报一句失败有用
    const target = document.querySelector('.about-copy')
    if (target) {
      const range = document.createRange()
      range.selectNodeContents(target)
      const selection = window.getSelection()
      selection?.removeAllRanges()
      selection?.addRange(range)
    }
    flash('复制失败，请手动复制')
  }
}
</script>

## 经历

<article class="work-poster career-card">
  <header class="career-head">
    <p class="career-when">2022.01 — 至今<span class="career-where">广东</span></p>
    <h3 class="career-org">某汽车电子公司</h3>
    <p class="career-role">高级工程师 × 工具链研发</p>
  </header>
  <p class="career-lead">前两年写 MCU 软件，2023 年起转做工具链。</p>
  <div class="career-phases">
    <div class="phase-row"><span class="phase-no">01</span><span class="phase-name">量产功能：APA / RPA 与 APA / HPP</span><span class="phase-year">2022 — 2023</span></div>
    <div class="phase-row"><span class="phase-no">02</span><span class="phase-name">工具链</span><span class="phase-year">2023 — 至今</span></div>
    <div class="phase-row"><span class="phase-no">03</span><span class="phase-name">软件与 AI 资产平台</span><span class="phase-year">2026 — 至今</span></div>
  </div>
  <div class="poster-more">
    <div>
      <section class="career-phase">
        <h4 class="phase-title">量产功能：APA / RPA 与 APA / HPP</h4>
        <p class="phase-meta"><span>C · MCU · CANoe · CAPL</span><span class="phase-year">2022 — 2023</span></p>
        <div class="phase-body">
          <p>两段整车项目经历，做的都是泊车功能。</p>
          <ul>
            <li>某 MPV 车型的 APA / RPA：用 C 写 MCU 域代码，负责规控算法集成与状态机开发；读英文需求文档整理客户设计；用 CANoe 采总线数据、写 CAPL 做软件测试；和 SOC 端一起定 IPC 通信；驻场做过关联件联调与实车验收。</li>
            <li>另一款车型的 APA / HPP：学自动泊车与记忆泊车的规范流程，掌握 MCU 端状态机跳转、中断这类服务，跟着项目收尾做调试与性能优化。</li>
          </ul>
        </div>
      </section>
      <section class="career-phase">
        <h4 class="phase-title">工具链</h4>
        <p class="phase-meta"><span>桌面端 · Web 端</span><span class="phase-year">2023 — 至今</span></p>
        <div class="phase-body">
          <p>五款工具都在解同一件事：车上采下来的数据，得有人在几秒钟内看明白。共同点是不管数据从哪儿来——总线、摄像头、雷达还是数据记录设备——都先想办法用最快的速度读进来，再用一张图把话说清楚。</p>
          <div class="career-tools">
            <div class="tool-row">
              <p class="tool-name">低速行泊数据回放系统</p>
              <p class="tool-desc">行泊数据回放，替掉 CANoe Graphics 那部分</p>
            </div>
            <div class="tool-row">
              <p class="tool-name">高速行车 3D 可视化系统</p>
              <p class="tool-desc">行车数据回放，六个面板同步</p>
            </div>
            <div class="tool-row">
              <p class="tool-name">多格式车载数据解析工具</p>
              <p class="tool-desc">mf4 / blf / csv / pcap / arxml 通吃的解析与图表分析</p>
            </div>
            <div class="tool-row">
              <p class="tool-name">自动驾驶数据记录系统工具</p>
              <p class="tool-desc">按标准走 DoIP/UDS 从设备取数，事件与视频一起回放，另配了 Web 管理端</p>
            </div>
            <div class="tool-row">
              <p class="tool-name">4D 毫米波雷达 · 点云 / 目标 · 实时 / 离线 · 三维可视化</p>
              <p class="tool-desc">实时与离线共用一条渲染管线</p>
            </div>
          </div>
        </div>
      </section>
      <section class="career-phase">
        <h4 class="phase-title">软件与 AI 资产平台</h4>
        <p class="phase-meta"><span>Next.js · React · Python · Flask · PostgreSQL · Redis · Celery</span><span class="phase-year">2026 — 至今</span></p>
        <div class="phase-body">
          <p>企业级的软件与 AI 资产平台。Admin 后台与 Portal 门户两套前端跑在同一套后端上：后端按 admin / dev / portal 三域分层，路由只管参数与鉴权，业务在 service、数据在 model；权限、审计、通知做成三条横切能力，三十九张表和两百多个接口都挂在这套结构上。部署是一个 docker compose 起七个服务：nginx 统一入口，前端、后端、Celery worker 与 beat、PostgreSQL 16、Redis 各管一段。</p>
          <p>详情见 <a href="/works">作品</a> 页。</p>
        </div>
      </section>
    </div>
  </div>
  <button class="poster-toggle" type="button" aria-expanded="false"><span>展开三阶段详情</span></button>
</article>
<article class="work-poster career-card">
  <header class="career-head">
    <p class="career-when">2021.01 — 2022.01<span class="career-where">湖南</span></p>
    <h3 class="career-org">某数据服务公司</h3>
    <p class="career-role">Python 爬虫工程师</p>
  </header>
  <p class="career-lead">第一份工作，写爬虫，一年多里做了十二个以上的网页、小程序和 App 采集项目。</p>
  <div class="poster-more">
    <div>
      <ul class="career-list">
        <li>Python 配合 MongoDB / Elasticsearch / Kafka / Hive / Redis 做高并发分布式采集</li>
        <li>分析目标站点的结构、接口与反爬，按需求写规则，用云服务器部署后台</li>
        <li>亿级数据的清洗过滤与分表存储，配合 Pandas / NumPy 做基础分析，另写了数据监控与告警</li>
      </ul>
    </div>
  </div>
  <button class="poster-toggle" type="button" aria-expanded="false"><span>展开 3 条</span></button>
</article>

## 关注

<dl class="about-creed">
  <div class="creed-item">
    <dt>要好用也要好看</dt>
    <dd>工具是给人用的：难用了不行，丑了也没人愿意打开。配色、图标、面板布局都自己定，该有的交互反馈一个不少。</dd>
  </div>
  <div class="creed-item">
    <dt>看得懂</dt>
    <dd>可视化的第一目标是让看数据的人少花时间。单位、坐标、时间轴对齐这类细节，决定一张图能不能拿来下结论。</dd>
  </div>
  <div class="creed-item">
    <dt>对自己的软件负责</dt>
    <dd>工具发出去之前先自己用几天：大文件卡不卡、换台机器能不能直接跑、出错时日志够不够定位。这些没人会写进需求，却决定它能不能被长期用下去。</dd>
  </div>
  <div class="creed-item">
    <dt>理解用户需求</dt>
    <dd>先弄清楚用的人卡在哪儿，再决定工具怎么做；需求没聊明白就动手，做得再快也是返工。</dd>
  </div>
</dl>

## 技能

<dl class="skill-list">
  <div class="skill-row">
    <dt>语言</dt>
    <dd>
      <span class="skill-tag">Python</span>
      <span class="skill-tag">C / C++</span>
      <span class="skill-tag">Go</span>
      <span class="skill-tag">Rust</span>
      <span class="skill-tag">TypeScript</span>
    </dd>
  </div>
  <div class="skill-row">
    <dt>桌面端框架</dt>
    <dd>
      <span class="skill-tag">PySide6</span>
      <span class="skill-tag">PyQt5</span>
      <span class="skill-tag">Tauri</span>
      <span class="skill-tag">Electron</span>
    </dd>
  </div>
  <div class="skill-row">
    <dt>前端框架</dt>
    <dd>
      <span class="skill-tag">Vue</span>
      <span class="skill-tag">React</span>
      <span class="skill-tag">Next.js</span>
      <span class="skill-tag">Tailwind</span>
      <span class="skill-tag">TanStack Query</span>
      <span class="skill-tag">Zustand</span>
    </dd>
  </div>
  <div class="skill-row">
    <dt>后端框架</dt>
    <dd>
      <span class="skill-tag">Flask</span>
      <span class="skill-tag">SQLAlchemy</span>
      <span class="skill-tag">Celery</span>
    </dd>
  </div>
  <div class="skill-row">
    <dt>数据库</dt>
    <dd>
      <span class="skill-tag">MySQL</span>
      <span class="skill-tag">SQLite</span>
      <span class="skill-tag">PostgreSQL</span>
      <span class="skill-tag">MongoDB</span>
      <span class="skill-tag">Redis</span>
      <span class="skill-tag">Elasticsearch</span>
    </dd>
  </div>
  <div class="skill-row">
    <dt>汽车电子</dt>
    <dd>
      <span class="skill-tag">MCU</span>
      <span class="skill-tag">SOC</span>
      <span class="skill-tag">ADAS</span>
      <span class="skill-tag">CANoe</span>
      <span class="skill-tag">XCP / CAN / ETH</span>
      <span class="skill-tag">CCS</span>
      <span class="skill-tag">Tasking</span>
    </dd>
  </div>
  <div class="skill-row">
    <dt>日常</dt>
    <dd>
      <span class="skill-tag">Git</span>
      <span class="skill-tag">云服务器运维</span>
      <span class="skill-tag">云存储运维</span>
      <span class="skill-tag">Markdown</span>
    </dd>
  </div>
</dl>

## 玩AI

工作之外的时间大半花在这儿，动机不复杂：好奇它到底能走多远。能顺手用进活儿里最好，用不进也不耽误玩。

<dl class="ai-list">
  <div class="ai-row">
    <dt>命令行助手</dt>
    <dd>opencode、kimi cli、qoder、trae、oh-my-pi 挨个试过，写代码、查日志、翻文档都交给它们打下手。</dd>
  </div>
  <div class="ai-row">
    <dt>dsh harness</dt>
    <dd>DeepSeek 的 agent harness，用的是浏览器界面：开个网页就能使唤。</dd>
  </div>
  <div class="ai-row">
    <dt>nanobot</dt>
    <dd>HKUDS 开源的 agent 框架，本机跑了一个，自托管助理里我最愿意留的一个：纯 Python，最初的核心 agent 只有三千多行；架构设计也很干净，渠道、模型、运行时三层分开，各自都能单独换。概括下来就四个字：大道至简。</dd>
  </div>
  <div class="ai-row">
    <dt>hermes agent</dt>
    <dd>Nous Research 的那个开源 agent，也是自托管：记忆跨会话累积，技能是它自己写出来的，再配几个 cron 让它自己跑。</dd>
  </div>
  <div class="ai-row">
    <dt>OpenClaw</dt>
    <dd>得单独吐一口：火到楼下排队代装，代码却长到四十多万行 TypeScript，一个个人助手做成整队人才能维护的体量；默认权限还敞着，循环试错烧 token，一两天一版升级就重配。热闹是真热闹，当长期工具不划算。</dd>
  </div>
</dl>

## 联系

<div class="about-colophon">
  <section class="col-block">
    <p class="col-label">联系</p>
    <dl class="col-facts">
      <div><dt>邮箱</dt><dd><button type="button" class="about-copy" @click="copyEmail">{{ email }}</button><span class="about-copy-hint" :class="{ 'is-on': hint }" role="status" aria-live="polite">{{ hint }}</span></dd></div>
      <div><dt>GitHub</dt><dd><a href="https://github.com/fluxixix">fluxixix</a></dd></div>
    </dl>
  </section>
</div>


