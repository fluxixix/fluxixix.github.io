---
title: 作品
pageClass: works
# 页头由 PageMasthead 生成（与关于页同一套语言），正文里不再重复写标题
# aside: false —— 不要右侧的本页目录，省下的宽度全部交给版画
aside: false
masthead: true
name: 作品
tag: 作品 · WORKS
meta: 工具链 · 个人项目
---

<!-- 页首的十件索引。它同时是三件事：
     一、进页面第一眼就知道「这里有十件、分别叫什么」——不必滚完九千像素才知道；
     二、右侧那十颗球是可点的，但球是 canvas 上的 raycast，键盘够不着，
         这一列 <a> 就是键盘走得通的等价路径；
     三、读到哪里，它是这一页唯一的全局进度参照。
     名字与分类由十节正文那里来，这里手写一份是为了它能在 SSR 里就存在——
     脚本事后生成的话，没 JS 就什么也没有 -->
<nav class="plate-index" aria-label="作品索引">
<a class="index-item" href="#flux-studio"><span class="index-no">01</span><span class="index-name">Flux Studio</span><span class="index-kind">平台</span></a>
<a class="index-item" href="#lowspeed-replay"><span class="index-no">02</span><span class="index-name">低速行泊数据回放系统</span><span class="index-kind">工具链</span></a>
<a class="index-item" href="#driving-3d"><span class="index-no">03</span><span class="index-name">高速行车 3D 可视化系统</span><span class="index-kind">工具链</span></a>
<a class="index-item" href="#multi-format-parser"><span class="index-no">04</span><span class="index-name">多格式车载数据解析工具</span><span class="index-kind">工具链</span></a>
<a class="index-item" href="#dssad-tool"><span class="index-no">05</span><span class="index-name">自动驾驶数据记录系统工具</span><span class="index-kind">工具链</span></a>
<a class="index-item" href="#radar-4d"><span class="index-no">06</span><span class="index-name">4D 毫米波雷达可视化系统</span><span class="index-kind">工具链</span></a>
<a class="index-item" href="#bricks"><span class="index-no">07</span><span class="index-name">Bricks</span><span class="index-kind">个人项目</span></a>
<a class="index-item" href="#dotfiles"><span class="index-no">08</span><span class="index-name">dotfiles</span><span class="index-kind">个人项目</span></a>
<a class="index-item" href="#this-site"><span class="index-no">09</span><span class="index-name">本站</span><span class="index-kind">个人项目</span></a>
<a class="index-item" href="#vitepress-theme"><span class="index-no">10</span><span class="index-name">vitepress-theme-fluxixix</span><span class="index-kind">个人项目</span></a>
</nav>

<section class="plate-scene" id="flux-studio">
<p class="scene-kind">平台 · PLATFORM</p>
<WorkPlate variant="nodes" tone="violet" code="01" note="ADMIN / PORTAL" label="节点网络：平台里的资产、权限与技能树如何互相挂上" />
<h2 class="scene-title">Flux Studio<span class="poster-sub">软件与 AI 资产平台</span></h2>
<p class="entry-meta">前端 —— Next.js 15 · React 19 · TypeScript · Tailwind · TanStack Query · Zustand · D3 · three.js</p>
<p class="entry-meta">后端 —— Python · Flask · SQLAlchemy · PostgreSQL · Redis · Celery · JWT / IAM SSO · Docker Compose</p>
<dl class="poster-metrics">
<div><dt>后端</dt><dd>2.75<span>万行</span></dd></div>
<div><dt>前端</dt><dd>3.4<span>万行</span></dd></div>
<div><dt>测试</dt><dd>1.8<span>万行</span></dd></div>
<div><dt>接口</dt><dd>255<span>个</span></dd></div>
<div><dt>数据表</dt><dd>39<span>张</span></dd></div>
</dl>
<p class="poster-lead">团队内部的软件分发与 AI 资产管理平台：管理后台负责软件上架、授权发放与 AI 资产审核，用户门户集中下载软件、安装技能并认领技能树，两套界面共用同一套后端、账号与权限。</p>
<figure class="arch-frame" style="--arch-ratio: 1.6">
<div class="arch-frame__wrap">
<iframe src="/arch/flux-studio.html?embed=1" loading="lazy" title="Flux Studio 架构图"></iframe>
</div>
<figcaption><a href="/arch/flux-studio.html" target="_blank" rel="noopener">完整架构图（可缩放 / 搜索）↗</a></figcaption>
</figure>
</section>

<section class="plate-scene" id="lowspeed-replay">
<p class="scene-kind">工具链 · TOOLCHAIN</p>
<WorkPlate variant="tracks" tone="cyan" code="02" note="APA · MPA · FREE" label="轨道：几路数据挂在同一条时间轴上" />
<h2 class="scene-title">低速行泊数据回放系统<span class="poster-sub">行泊数据回放</span></h2>
<p class="entry-meta">Python · PyQt5 · PyQtGraph · asammdf · cantools / python-can · OpenCV · NumPy · Pandas · PyInstaller · PyArmor</p>
<dl class="poster-metrics">
<div><dt>加载</dt><dd>0.3<span>s</span></dd></div>
<div><dt>页签</dt><dd>5<span>个</span></dd></div>
<div><dt>格式</dt><dd>4<span>类</span></dd></div>
<div><dt>部署</dt><dd>单文件</dd></div>
</dl>
<p class="poster-lead">面向行泊功能的行车数据回放工具：把 mf4 里的 CAN/XCP 信号按 DBC 解码，与车位、超声波雷达点和视频对齐到同一条时间轴，按泊车场景分页签回放，另留一个自由分析页临时拖信号出曲线。</p>
<figure class="arch-frame" style="--arch-ratio: 1.6">
<div class="arch-frame__wrap">
<iframe src="/arch/alg-replay.html?embed=1" loading="lazy" title="低速行泊数据回放系统架构图"></iframe>
</div>
<figcaption><a href="/arch/alg-replay.html" target="_blank" rel="noopener">完整架构图（可缩放 / 搜索）↗</a></figcaption>
</figure>
</section>

<section class="plate-scene" id="driving-3d">
<p class="scene-kind">工具链 · TOOLCHAIN</p>
<WorkPlate variant="grid" tone="violet" code="03" note="11 PANELS" label="面板网格：十几个视图盯着同一段时间" />
<h2 class="scene-title">高速行车 3D 可视化系统<span class="poster-sub">多面板行车数据回放</span></h2>
<p class="entry-meta">Python · PySide6 · PyQtGraph OpenGL · OpenCV · protobuf · NumPy · Pandas · PyInstaller · PyArmor</p>
<dl class="poster-metrics">
<div><dt>面板</dt><dd>11<span>个</span></dd></div>
<div><dt>功能</dt><dd>10<span>种</span></dd></div>
<div><dt>加载</dt><dd>2<span>倍</span></dd></div>
<div><dt>EDR 变体</dt><dd>2<span>种</span></dd></div>
</dl>
<p class="poster-lead">面向高阶行车功能的数据分析平台：登录后按 ACC、AEB、LCA、HWA、P2P 等功能进入，多路 CSV 与 bin 视频在加载阶段对齐成「一帧一行」，3D 场景、信号曲线、视频与目标列表等十余个面板沿同一条时间轴联动回放。</p>
<figure class="arch-frame" style="--arch-ratio: 1.6">
<div class="arch-frame__wrap">
<iframe src="/arch/adas-app.html?embed=1" loading="lazy" title="高速行车 3D 可视化系统架构图"></iframe>
</div>
<figcaption><a href="/arch/adas-app.html" target="_blank" rel="noopener">完整架构图（可缩放 / 搜索）↗</a></figcaption>
</figure>
</section>

<section class="plate-scene" id="multi-format-parser">
<p class="scene-kind">工具链 · TOOLCHAIN</p>
<WorkPlate variant="stack" tone="cyan" code="04" note="MF4 · BLF · PCAP" label="层叠：各种格式进同一个入口" />
<h2 class="scene-title">多格式车载数据解析工具<span class="poster-sub">一个入口读所有格式</span></h2>
<p class="entry-meta">Python · PySide6 · PyQtGraph · asammdf · cantools / canmatrix · python-can · dpkt · NumPy · Pandas · PyInstaller · PyArmor</p>
<dl class="poster-metrics">
<div><dt>业务代码</dt><dd>2<span>万行</span></dd></div>
<div><dt>格式</dt><dd>7<span>类</span></dd></div>
<div><dt>界面</dt><dd>双语</dd></div>
<div><dt>分发</dt><dd>单文件</dd></div>
</dl>
<p class="poster-lead">车载总线数据的「瑞士军刀」：一个入口读 mf4、blf、csv、pcap、bin 等七类格式并联合 DBC 解码，另一组工具负责报文裁剪、arxml 与 DBC 互转、DBC 导出 Excel 和抓包 IP 配置，新项目的 UDP / SOME/IP 报文以插件方式接入。</p>
<figure class="arch-frame" style="--arch-ratio: 1.6">
<div class="arch-frame__wrap">
<iframe src="/arch/slingshot.html?embed=1" loading="lazy" title="多格式车载数据解析工具架构图"></iframe>
</div>
<figcaption><a href="/arch/slingshot.html" target="_blank" rel="noopener">完整架构图（可缩放 / 搜索）↗</a></figcaption>
</figure>
</section>

<section class="plate-scene" id="dssad-tool">
<p class="scene-kind">工具链 · TOOLCHAIN</p>
<WorkPlate variant="pulse" tone="violet" code="05" note="DOIP · UDS" label="脉冲：一条诊断链路里的一次会话" />
<h2 class="scene-title">自动驾驶数据记录系统工具<span class="poster-sub">GB 44497-2024 · 桌面 + Web</span></h2>
<p class="entry-meta">桌面端 —— Python · PySide6 · PyQtGraph · DoIP / UDS · NumPy · PyArmor</p>
<p class="entry-meta">Web 端 —— Flask · Celery · PostgreSQL · Redis · React · Ant Design</p>
<dl class="poster-metrics">
<div><dt>UDS 服务</dt><dd>9<span>项</span></dd></div>
<div><dt>渗透修复</dt><dd>16<span>项</span></dd></div>
<div><dt>端</dt><dd>2<span>套</span></dd></div>
<div><dt>留痕</dt><dd>本地 + 云</dd></div>
</dl>
<p class="poster-lead">按国标 GB 44497-2024 从行车记录设备取证的桌面 + Web 工具：桌面端走自实现的 DoIP/UDS 链路（含 0x29 证书认证与文件下载）取出事件数据，事件列表、信号曲线、视频与基本信息沿一条时间轴对齐分析；操作先在本地留痕、联网补传，Web 后台统一管理账号、权限与审计。</p>
<figure class="arch-frame" style="--arch-ratio: 1.6">
<div class="arch-frame__wrap">
<iframe src="/arch/dssad.html?embed=1" loading="lazy" title="自动驾驶数据记录系统工具架构图"></iframe>
</div>
<figcaption><a href="/arch/dssad.html" target="_blank" rel="noopener">完整架构图（可缩放 / 搜索）↗</a></figcaption>
</figure>
</section>

<section class="plate-scene" id="radar-4d">
<p class="scene-kind">工具链 · TOOLCHAIN</p>
<WorkPlate variant="cloud" tone="cyan" code="06" note="20 HZ · RT / OFFLINE" label="点云：一簇散点里只有一个确定的目标" />
<h2 class="scene-title">4D 毫米波雷达可视化系统<span class="poster-sub">点云 / 目标 · 实时 / 离线</span></h2>
<p class="entry-meta">Python · PySide6 · PyQtGraph OpenGL · NumPy · dpkt · OpenCV · typer / rich · PyInstaller · PyArmor</p>
<dl class="poster-metrics">
<div><dt>刷新</dt><dd>20<span>Hz</span></dd></div>
<div><dt>点云</dt><dd>3000<span>点</span></dd></div>
<div><dt>目标</dt><dd>200<span>个</span></dd></div>
<div><dt>报文</dt><dd>4<span>类</span></dd></div>
</dl>
<p class="poster-lead">4D 毫米波雷达的数据采集与可视化工具：实时接收雷达 UDP 报文，边录边看点云与目标，也能把定长 TLV 记录离线回放，实时与离线共用同一条 20Hz 渲染管线；另带一套无头 CLI，不接界面也能采集、模拟发包和批量转 CSV。</p>
<figure class="arch-frame" style="--arch-ratio: 1.3846">
<div class="arch-frame__wrap">
<iframe src="/arch/radar-vision.html?embed=1" loading="lazy" title="4D 毫米波雷达可视化系统数据流图"></iframe>
</div>
<figcaption><a href="/arch/radar-vision.html" target="_blank" rel="noopener">完整数据流图（可缩放 / 搜索）↗</a></figcaption>
</figure>
</section>

<section class="plate-scene" id="bricks">
<p class="scene-kind">个人项目 · SIDE PROJECT</p>
<WorkPlate variant="blocks" tone="violet" code="07" note="32 PARSERS" label="积木：装上一块就能解析一种格式" />
<h2 class="scene-title">Bricks<span class="poster-sub">多格式数据解析框架</span></h2>
<p class="entry-meta">技术栈 —— Python 3.10+ · 核心零依赖 · Typer / Rich · MCP · pytest + ruff + mypy · GitHub Actions</p>
<p class="entry-meta">状态 —— 开发中，仓库尚未公开，也未发布到 PyPI</p>
<dl class="poster-metrics">
<div><dt>包</dt><dd>1.4<span>万行</span></dd></div>
<div><dt>解析器</dt><dd>32<span>个</span></dd></div>
<div><dt>测试</dt><dd>2900<span>行</span></dd></div>
<div><dt>用例</dt><dd>265<span>个</span></dd></div>
</dl>
<p class="poster-lead">一个可插拔的多格式数据解析框架：每种格式实现为一个 Brick，装上对应扩展即自动识别并解析，既能在 Python 里串成管道、链式清洗与校验，也能通过统一信封的命令行和 MCP 接口直接被 AI Agent 调用。</p>
<figure class="arch-frame" style="--arch-ratio: 1.6">
<div class="arch-frame__wrap">
<iframe src="/arch/bricks.html?embed=1" loading="lazy" title="Bricks 多格式数据解析框架架构图"></iframe>
</div>
<figcaption><a href="/arch/bricks.html" target="_blank" rel="noopener">完整架构图（可缩放 / 搜索）↗</a></figcaption>
</figure>
</section>

<section class="plate-scene" id="dotfiles">
<p class="scene-kind">个人项目 · SIDE PROJECT</p>
<WorkPlate variant="nodes" tone="cyan" code="08" note="~/.CONFIG" label="节点网络：配置目录之间的软链接" />
<h2 class="scene-title">dotfiles<span class="poster-sub">macOS 个人配置仓库</span></h2>
<p class="entry-meta">技术栈 —— Fish + Lua + Bash + Homebrew（Brewfile）+ GitHub Actions</p>
<p class="entry-meta">状态 —— 长期维护</p>
<p class="entry-meta">链接 —— <a href="https://github.com/fluxixix/dotfiles">github.com/fluxixix/dotfiles</a></p>
<dl class="poster-metrics">
<div><dt>配置</dt><dd>4<span>套</span></dd></div>
<div><dt>部署</dt><dd>2<span>条命令</span></dd></div>
<div><dt>CI</dt><dd>arm64</dd></div>
<div><dt>状态</dt><dd>长期</dd></div>
</dl>
<p class="poster-lead">一套 macOS 开发环境的声明式管理方案：只把手写配置纳入仓库，插件与补全交给各自的包管理器恢复；restore 脚本把工具目录软链接到 <code>~/.config</code>，配合 Brewfile 与 CI 一致性校验，换新机器两条命令搬完整个环境。</p>
</section>

<section class="plate-scene" id="this-site">
<p class="scene-kind">个人项目 · SIDE PROJECT</p>
<WorkPlate variant="frame" tone="violet" code="09" note="FLUXIXIX.GITHUB.IO" label="页面框架：栏目、栏线、一块内容" />
<h2 class="scene-title">本站<span class="poster-sub">VitePress 个人站</span></h2>
<p class="entry-meta">技术栈 —— VitePress + TypeScript + GitHub Actions</p>
<p class="entry-meta">状态 —— 长期维护</p>
<p class="entry-meta">链接 —— <a href="https://fluxixix.github.io">fluxixix.github.io</a></p>
<dl class="poster-metrics">
<div><dt>技术栈</dt><dd>3<span>项</span></dd></div>
<div><dt>主题</dt><dd>自研</dd></div>
<div><dt>部署</dt><dd>推送即发布</dd></div>
<div><dt>内容</dt><dd>全 Markdown</dd></div>
</dl>
<p class="poster-lead">这个站点本身也是一件作品：基于 VitePress 的纯静态个人站，文章全部用 Markdown 写作，首页、文章、作品、归档、Now、关于六种版式由自研主题提供，构建时自动生成 RSS，推送到 main 即由 GitHub Actions 发布，全程没有服务器。</p>
</section>

<section class="plate-scene" id="vitepress-theme">
<p class="scene-kind">个人项目 · SIDE PROJECT</p>
<WorkPlate variant="stack" tone="cyan" code="10" note="17 STYLE SHEETS" label="层叠：十七册样式叠在默认主题之上，顺序不能反" />
<h2 class="scene-title">vitepress-theme-fluxixix<span class="poster-sub">VitePress 编辑部式主题</span></h2>
<p class="entry-meta">技术栈 —— Vue 3 · TypeScript · 纯 CSS · VitePress 2 alpha · Node 24</p>
<p class="entry-meta">状态 —— v0.4.0 · MIT · 不上 npm registry</p>
<p class="entry-meta">链接 —— <a href="https://github.com/fluxixix/vitepress-theme-fluxixix">github.com/fluxixix/vitepress-theme-fluxixix</a></p>
<dl class="poster-metrics">
<div><dt>样式</dt><dd>17<span>册</span></dd></div>
<div><dt>组件</dt><dd>6<span>个</span></dd></div>
<div><dt>检查</dt><dd>4<span>道</span></dd></div>
<div><dt>分发</dt><dd>纯源码</dd></div>
</dl>
<p class="poster-lead">把本站版式抽成的可安装 VitePress 主题：不替换默认主题、只在其上层叠加，页面用 pageClass 声明形态才长出对应版式，并附带站点配置、RSS 生成、本地搜索与一条 <code>init</code> 命令生成整站的零依赖脚手架，按 git tag 从 GitHub 发版。</p>
</section>
