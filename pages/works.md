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
<p class="poster-lead">Admin 后台与 Portal 门户共用一套后端：软件上架与授权分发一条线，AI 资产提交审核一条线，再加一张技能树把能力认领到团队——AI 化进度第一次有了统一口径。</p>
<ul class="scene-notes">
<li>255 个接口、39 张表按三域分层，跨域模型用类型前置引用拆掉循环导入</li>
<li>权限不采信 token：每次请求从库里现查角色，改完立刻生效，不用等过期</li>
<li>每个请求落两张审计表：操作日志与接口耗时，独立 session 提交，不污染主事务</li>
<li>9 个 Celery 任务把提交、审核、发布、通知全部异步化，配 acks_late，worker 崩了能重投</li>
<li>前端是 Next.js 15 双端单体：自建 12 个 UI 原语，技能树是一张 D3 力导向图</li>
</ul>
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
<p class="poster-lead">公司第一套自研的行泊数据回放工具。四个功能页签后来又扩出一个自由分析页，五个页签共用同一套数据层，曲线、俯视场景图与视频挂在同一条时间轴上。</p>
<ul class="scene-notes">
<li>文件加载、解析与图形初始化平均 0.3s，比供应商那套快一个量级</li>
<li>读 mf4 时把用到的通道一次性常驻内存，回放只做查表切片；帧率不一的变量重采样到 20ms</li>
<li>俯视图里的车位、超声波雷达点、视觉目标都是预建图元，回放只切可见性，不重建</li>
<li>除 mf4/mdf 外还能读 blf 与 DBC/arxml，视频按时间戳直接跳帧，不逐帧解码</li>
<li>用 PyInstaller 打成单个可执行文件，双击就跑，不要求装 Python</li>
</ul>
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
<p class="poster-lead">从零开始写的行车数据分析工具。以前看一段数据是打开 csv 逐行翻，现在把数采包丢进去，多路 CSV 对齐成「一帧一行」，十一个面板跟着同一条时间轴走。</p>
<ul class="scene-notes">
<li>覆盖 ACC / LCA / HWA / P2P / AEB 等十种功能，HWA 与 P2P 另有 EDR 变体</li>
<li>3D 场景用 pyqtgraph 的 OpenGL 画，车道线、规划路径、感知目标与高精地图共用一个坐标系</li>
<li>视频不做解码：图像帧从 bin 里逐帧取出，OpenCV 叠上感知图元，按时间戳查字典取帧</li>
<li>加载阶段线程池并行读 CSV、多进程处理图像；3D 图元启动时一次建好，回放只更新数据</li>
<li>同等数据量下加载速度约为供应商工具的两倍；目标框绕底边旋转，虚线车道线也是自写图元</li>
</ul>
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
<p class="poster-lead">各家供应商、各个项目导出的格式都不一样，最烦的是得先用不同工具把 mf4、blf、csv、pcap 分别打开。这里只做一个入口：读进来都进同一张表和一排曲线。</p>
<ul class="scene-notes">
<li>支持 mf4/mdf、blf/asc、csv、pcap、bin、设备日志、dbc/arxml 七类格式</li>
<li>多路 DBC 并行解码、通道自动检测；信号表与曲线联动，基准线差分读数、Go To X 跳转</li>
<li>顺手做成了格式转换入口：arxml ↔ dbc 互转、mf4 按时间裁剪、DBC 导出 Excel</li>
<li>新项目的报文各写一份解析器接入，UDP 抓包、SOME/IP、C 结构体三种形态</li>
<li>读 pcap 时先扫一遍包数再解析，用来推进度，同时检测时间戳倒流这类脏数据</li>
</ul>
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
<p class="poster-lead">按 GB 44497-2024 的要求取出记录设备里的事件数据。设备侧只留 DoIP/UDS 一条路，诊断链路自己实现，取回的事件、目标物、曲线与视频对着同一条时间轴。</p>
<ul class="scene-notes">
<li>实现的 UDS 服务：0x10 会话、0x3E 保活、0x31 例程、0x22 读 DID、0x27 安全访问、0x29 认证与文件传输</li>
<li>0x29 认证走证书挑战加签名，传输层带 NRC 0x78 轮询，在线从设备下载事件数据与视频</li>
<li>事件、目标物、信号曲线与视频共用一条时间轴，拖游标时四边同步</li>
<li>操作留痕先写本地 SQLite，联网后补传云端，账号权限与云端共用一套</li>
<li>上线前自己跑了一轮渗透测试，16 项逐条修完：硬编码密钥、调试器暴露、依赖 CVE 与越权</li>
</ul>
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
<p class="poster-lead">做 4D 毫米波雷达时，采下来的数据得当场看出问题：点云塌没塌、目标跳不跳、丢包丢在哪一帧。实时采集与离线回放做成了一套东西，共用一条渲染管线。</p>
<ul class="scene-notes">
<li>解析 UDP 载荷里的交互头与应用头，点云 / 目标 / 状态 / 车辆信息四类报文，做 CRC16 校验与分包重组</li>
<li>落盘成定长 TLV 帧，1456 字节头加 3000 个点与 200 个目标，异步分片轮转写，另存时间戳文件</li>
<li>回放时扫魔数建帧索引，与实时模式共用同一套渲染管线，20Hz 刷新</li>
<li>丢包检测按 rolling counter 的连续性算：差值落在 2~10 之间计为丢包，更大的当作计数回绕放过</li>
<li>带一套 CLI，不接界面也能采集和批量转 CSV；另有模拟数据源按原时间戳发包，不接硬件也能调界面</li>
</ul>
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
<p class="poster-lead">像搭积木一样解析数据：每种格式一个解析器，装上就能自动认格式、按需装扩展、串成管道，也能直接被 AI Agent 调用。核心只有一个抽象 Brick 和一张注册表。</p>
<ul class="scene-notes">
<li>核心零依赖，八块解析器都在 extras 里：汽车、大数据、科学计算、序列化、文档、机器人、网络、AI</li>
<li>格式嗅探分四级：显式指定 → 扩展名 → 魔数 → 内容探测；注册中心按名称、扩展名、MIME 查找</li>
<li>解析之外另配清洗（DataCleaner 链式调用）、验证（规则引擎与 JSON Schema）与性能工具</li>
<li>五个汽车解析器顺着工作来：MF4 把 XCP 标定信号与 CAN 报文拆开，BLF / ASC 能联合 DBC 解码</li>
<li>CLI 在非 TTY 或带 --json 时输出统一信封：数据走 stdout、诊断走 stderr，错误码固定</li>
</ul>
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
<p class="poster-lead">macOS 个人配置仓库。手写配置进仓库，插件、主题和补全交给各自的包管理器恢复；部署时每个工具目录软链接到 <code>~/.config</code>，换新电脑两条命令搬完。</p>
<ul class="scene-notes">
<li>核心约束是「仓库只放手写配置」：Neovim 插件、Yazi 风味、Fish 补全这类一律不入库</li>
<li>代价是首次部署多几步，换来 <code>git log</code> 里只有自己的改动，翻历史不被插件更新淹掉</li>
<li>四个工具目录各自软链接进 <code>~/.config</code>，部署脚本一条命令建链、一条命令回收</li>
<li>Homebrew 用 Brewfile 管命令行工具，换机器一条 <code>brew bundle</code> 装齐，版本不靠记忆</li>
<li>CI 在 arm64 runner 上跑静态检查与一致性校验，并用假 <code>HOME</code> 把部署脚本完整演一遍</li>
</ul>
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
<p class="poster-lead">这个站点本身也算一个项目：VitePress 加一套自研主题，文章全是 Markdown，推送到 GitHub 自动构建发布。栏目形态由主题提供，页面自己声明用哪种。</p>
<ul class="scene-notes">
<li>构建产物是纯静态文件，推到 main 由 GitHub Actions 发布到 Pages，没有服务器</li>
<li>RSS 在构建结束那一刻生成，绝对链接取自站点地址那一个常量，改域名只改一处</li>
<li>归档、Now、作品、关于四个栏目各有页面形态，不写 frontmatter 就什么也不多</li>
<li>渲染一致性检查脚本用无头 Chromium 比对改造前后的几何与计算样式，三个视口各跑一遍</li>
<li>主题源码拆在独立仓库，本站按 git tag 安装，主题升版本不改这里的一行代码</li>
</ul>
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
<p class="poster-lead">本站的版式抽成了独立主题包，从 GitHub 装到别的 VitePress 站上。只在默认主题上叠一层、不替换：没启用的形态不产出节点，宿主站的 CSS 照样压得住。</p>
<ul class="scene-notes">
<li>形态由页面自己触发：pageClass 写 archive / works / about 才长出对应版式，masthead: true 才多出页头</li>
<li>样式不写 @layer 是试出来的：默认主题与组件 scoped 样式都没分层，主题一进层就被反压，还不报错</li>
<li>只发 GitHub，git tag 就是版本；必须写 git+https://，github: 简写会被解析成 ssh</li>
<li>/site 与 /rss 归 Node 加载，入口指向 .ts 时外部用户第一步就抛类型剥离错误，于是加了打包冒烟</li>
<li>另带一个零依赖脚手架，一条 npx … init my-blog 生成能跑的站点，.npmrc 已经配好</li>
</ul>
</section>
