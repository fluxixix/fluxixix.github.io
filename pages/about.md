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

写代码五年，做过运维、爬虫、嵌入式 和 工具链，企业级的软件与AI资产管理平台， 玩一些 AI 相关的东西。

## 经历

### 某汽车电子公司 · 高级工程师 × 工具链研发

<p class="entry-meta">2022.01 — 至今 · 广东</p>

前两年写 MCU 软件，2023 年起转做工具链。

#### 量产功能：APA / RPA 与 APA / HPP

<p class="entry-meta">C · MCU · CANoe · CAPL · 2022 — 2023</p>

两段整车项目经历，做的都是泊车功能。

- 某 MPV 车型的 APA / RPA：用 C 写 MCU 域代码，负责规控算法集成与状态机开发；读英文需求文档整理客户设计；用 CANoe 采总线数据、写 CAPL 做软件测试；和 SOC 端一起定 IPC 通信；驻场做过关联件联调与实车验收。
- 另一款车型的 APA / HPP：学自动泊车与记忆泊车的规范流程，掌握 MCU 端状态机跳转、中断这类服务，跟着项目收尾做调试与性能优化。

#### 工具链

<p class="entry-meta">Python · Qt / PySide6 · PyQtGraph · OpenGL · PyInstaller / PyArmor · 2023 — 至今</p>

五款工具都在解同一件事：车上采下来的数据，得有人在几秒钟内看明白。共同点是不管数据从哪儿来——总线、摄像头、雷达还是数据记录设备——都先想办法用最快的速度读进来，再用一张图把话说清楚。

- **低速行泊数据回放系统** —— 行泊数据回放，替掉 CANoe Graphics 那部分
- **高速行车 3D 可视化系统** —— 行车数据回放，六个面板同步
- **多格式车载数据解析工具** —— mf4 / blf / csv / pcap / arxml 通吃的解析与图表分析
- **自动驾驶数据记录系统工具** —— 按标准走 DoIP/UDS 从设备取数，事件与视频一起回放，另配了 Web 管理端
- **4D毫米波雷达 · 点云/目标 · 实时/离线 · 三维可视化系统** —— 实时与离线共用一条渲染管线

定位、技术栈和取舍写在[作品](/projects)页。

桌面端开发是自学的，没什么捷径，就是问题来了一个个解决。

#### 软件与 AI 资产平台

<p class="entry-meta">Next.js · React · Python · Flask · PostgreSQL · Redis · Celery · 2026 — 至今</p>

企业级的软件与 AI 资产平台。Admin 后台与 Portal 门户两套前端跑在同一套后端上：后端按 admin / dev / portal 三域分层，路由只管参数与鉴权，业务在 service、数据在 model；权限、审计、通知做成三条横切能力，三十九张表和两百多个接口都挂在这套结构上。部署是一个 docker compose 起七个服务：nginx 统一入口，前端、后端、Celery worker 与 beat、PostgreSQL 16、Redis 各管一段。

具体做了什么写在[作品](/projects)页。

### 某数据服务公司 · Python 爬虫工程师

<p class="entry-meta">2021.01 — 2022.01 · 湖南</p>

第一份工作，写爬虫，一年多里做了十二个以上的网页、小程序和 App 采集项目。

- Python 配合 MongoDB / Elasticsearch / Kafka / Hive / Redis 做高并发分布式采集
- 分析目标站点的结构、接口与反爬，按需求写规则，用云服务器部署后台
- 亿级数据的清洗过滤与分表存储，配合 Pandas / NumPy 做基础分析，另写了数据监控与告警

这份工作最大的收获是：数据拿到手只是开始，能拿它下结论才算完。后来会跑去做可视化，大概就是从这里起的念头。

## 关注

- **要好用也要好看** —— 工具是给人用的：难用了不行，丑了也没人愿意打开。配色、图标、面板布局都自己定，该有的交互反馈一个不少
- **看得懂** —— 可视化的第一目标是让看数据的人少花时间。单位、坐标、时间轴对齐这类细节，决定一张图能不能拿来下结论
- **少让人等** —— 工具的天花板常常卡在加载上，几百兆的 log 打不开，再好的交互也用不上
- **能自己跑起来** —— 打包成单个可执行文件、不假设对方的环境，是我对自己工具的硬要求
- **别重复** —— 同一件事做第二遍，就该写成工具

## 技能

- **语言** —— Python（主力）、C/C++（MCU / 嵌入式）；Go、Rust、TypeScript 不太会写，但都看得懂
- **桌面端** —— PySide6 / PyQt5 / PyQtGraph、OpenGL、OpenCV、PyInstaller / PyArmor 打包
- **数据库** —— MySQL、SQLite、PostgreSQL、MongoDB、Redis、Elasticsearch、Kafka、Hive
- **汽车电子** —— ADAS 功能状态机与运行规则、规控算法集成、CANoe / CAPL、XCP / CAN 总线数据采集与解析、CCS / Tasking
- **日常** —— Git、云服务器与云存储运维、Markdown 文档

## 玩AI

工作之外的时间大半花在这儿，动机不复杂：好奇它到底能走多远。能顺手用进活儿里最好，用不进也不耽误玩。

- **命令行助手** —— opencode、kimi cli、qoder、trae、oh-my-pi 挨个试过，写代码、查日志、翻文档都交给它们打下手
- **dsh harness** —— DeepSeek 的 agent harness，用的是浏览器界面：开个网页就能使唤
- **nanobot** —— HKUDS 开源的 agent 框架，本机跑了一个，自托管助理里我最愿意留的一个：纯 Python，最初的核心 agent 只有三千多行；架构设计也很干净，渠道、模型、运行时三层分开，各自都能单独换。概括下来就四个字：大道至简
- **hermes agent** —— Nous Research 的那个开源 agent，也是自托管：记忆跨会话累积，技能是它自己写出来的，再配几个 cron 让它自己跑
- **OpenClaw** —— 得单独吐一口：火到楼下排队代装，代码却长到四十多万行 TypeScript，一个个人助手做成整队人才能维护的体量；默认权限还敞着，循环试错烧 token，一两天一版升级就重配。热闹是真热闹，当长期工具不划算
- **还在学** —— happy-llm，一直没静下心看完

## 教育

**湖南工业大学** · 电子科学与技术 · 工学学士

<p class="entry-meta">2015.09 — 2019.07 · 英语 CET-6 / 日语 JLPT-N2</p>

## 联系我

- 邮箱：<button type="button" class="about-copy" @click="copyEmail">{{ email }}</button><span class="about-copy-hint" :class="{ 'is-on': hint }" role="status" aria-live="polite">{{ hint }}</span>
- GitHub：[fluxixix](https://github.com/fluxixix)


