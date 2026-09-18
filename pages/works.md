---
title: 作品
pageClass: works
# 页头由 PageMasthead 生成（与关于页同一套语言），正文里不再重复写标题
# aside: false —— 不要右侧的本页目录，省下的宽度全部交给作品本身
aside: false
masthead: true
name: 作品
tag: 作品 · WORKS
meta: 工具链 · 个人项目
---

<article class="work-poster">
<p class="poster-kind">平台 · PLATFORM</p>
<h3 id="flux-studio" class="poster-title">Flux Studio<span class="poster-sub">软件与 AI 资产平台</span></h3>
<p class="entry-meta">前端 —— Next.js 15 · React 19 · TypeScript · Tailwind · TanStack Query · Zustand · D3 · three.js</p>
<p class="entry-meta">后端 —— Python · Flask · SQLAlchemy · PostgreSQL · Redis · Celery · JWT / IAM SSO · Docker Compose</p>
<div class="poster-body">
<WorkPlate variant="nodes" tone="violet" code="01" note="ADMIN / PORTAL" label="节点网络：平台里的资产、权限与技能树如何互相挂上" />
<div class="poster-main">
<dl class="poster-metrics">
<div><dt>后端</dt><dd>2.75<span>万行</span></dd></div>
<div><dt>前端</dt><dd>3.4<span>万行</span></dd></div>
<div><dt>测试</dt><dd>1.8<span>万行</span></dd></div>
<div><dt>接口</dt><dd>255<span>个</span></dd></div>
<div><dt>数据表</dt><dd>39<span>张</span></dd></div>
</dl>
<p class="poster-lead">Admin 管理后台 + Portal 用户门户两套前端共用一个后端。软件上架、版本与授权分发、下载审计是一条线；AI 资产的提交、审核、发布、一键安装是另一条线；再加一张把「领域 → 子领域 → 技能」逐项认领到团队的技能树，部门 AI 化进度第一次有了统一口径。</p>
<div class="poster-more">
<ul>
<li>后端 255 个接口、39 张表，按 admin / dev / portal 三域分成「路由 → 服务 → 模型」三层，跨域模型用类型前置引用拆掉循环导入</li>
<li>权限不采信 token：JWT 双 token（60 分钟 / 7 天）配 Redis 黑名单，但角色与权限每次请求从库里现查——改完权限立刻生效，不用等 token 过期；381 处细粒度权限点；对外接口用 API Key，secret 走 bcrypt，带 IP 白名单与过期时间</li>
<li>每个请求同时落两张审计表：操作日志 + 接口调用统计（含毫秒耗时），用独立 session 提交，不污染主请求事务</li>
<li>9 个 Celery 任务把提交、审核、发布、反馈通知全部异步化——否则一个请求要等飞书接口十秒；Beat 每天 09:30 扫技能截止倒计时，任务配 acks_late，worker 崩了能重投</li>
<li>AI 资产包解析：zip / tar / 7z / rar 八种格式解包、文件树扫描、37 种语言的代码预览，检查结果写进审核记录；审核页左右分栏可拖拽，左边文件树右边带行号预览</li>
<li>一键安装：按资产类型与目标 AI Agent 动态生成 PowerShell 安装脚本</li>
<li>状态机与跨域联动是最费脑子的部分：AI 条目 9 个状态、技能项 4 个状态，审核通过要同步改技能项状态，取消认领要级联删掉关联条目及其全部版本与审核记录</li>
<li>前端是 Next.js 15 App Router 的双端单体：自建 12 个 UI 原语，暗色切换用 View Transitions 做圆形揭示；技能树是一张 D3 力导向图，节点可缩放拖拽、点开抽屉走认领与攻坚；另有 three.js 星空背景与 canvas 光标</li>
<li>一个 docker compose 起七个服务（nginx、前端、后端、worker、beat、PostgreSQL 16、Redis）：nginx 统一入口并给静态资源长缓存；启动脚本自动生成随机密钥，备份脚本 pg_dump + 压缩 + 异地同步</li>
</ul>
</div>
</div>
</div>
<button class="poster-toggle" type="button" aria-expanded="false"><span>展开 9 条详情</span></button>
</article>

<article class="work-poster">
<p class="poster-kind">工具链 · TOOLCHAIN</p>
<h3 id="lowspeed-replay" class="poster-title">低速行泊数据回放系统<span class="poster-sub">行泊数据回放</span></h3>
<p class="entry-meta">Python · PyQt5 · PyQtGraph · asammdf · cantools / python-can · OpenCV · NumPy · Pandas · PyInstaller · PyArmor</p>
<div class="poster-body">
<WorkPlate variant="tracks" tone="cyan" code="02" note="APA · MPA · FREE" label="轨道：几路数据挂在同一条时间轴上" />
<div class="poster-main">
<dl class="poster-metrics">
<div><dt>加载</dt><dd>0.3<span>s</span></dd></div>
<div><dt>页签</dt><dd>5<span>个</span></dd></div>
<div><dt>格式</dt><dd>4<span>类</span></dd></div>
<div><dt>部署</dt><dd>单文件</dd></div>
</dl>
<p class="poster-lead">公司第一套自研的行泊数据回放工具。APA、MPA、CVP、FTBA 四个功能页签，后来扩出一个 FREE 自由分析页——五个页签共用同一套数据层与绘图函数，加一个功能只写它自己那部分；曲线、俯视场景图与视频挂在同一条时间轴上。</p>
<div class="poster-more">
<ul>
<li>文件加载、数据解析、图形初始化平均 0.3s 完成，比供应商的工具快一个量级</li>
<li>读 mf4 时一次性把用到的通道全部取出来常驻内存，回放只做查表切片；帧率不一致的变量自动重采样到 20ms 再按时间戳对齐</li>
<li>俯视图里的车位、超声波雷达点、视觉目标都是建好的图元，回放时只切可见性，不重新创建</li>
<li>除 mf4/mdf 外还能读 blf 与 DBC/arxml，视频按时间戳直接跳帧，不逐帧解码</li>
<li>用 PyInstaller 打成单个可执行文件，全平台通用，双击就能跑，不要求对方装 Python</li>
<li>一年里支撑了多个主机厂项目的数据分析</li>
</ul>
</div>
</div>
</div>
<button class="poster-toggle" type="button" aria-expanded="false"><span>展开 6 条详情</span></button>
</article>

<article class="work-poster">
<p class="poster-kind">工具链 · TOOLCHAIN</p>
<h3 id="driving-3d" class="poster-title">高速行车 3D 可视化系统<span class="poster-sub">多面板行车数据回放</span></h3>
<p class="entry-meta">Python · PySide6 · PyQtGraph OpenGL · OpenCV · protobuf · NumPy · Pandas · PyInstaller · PyArmor</p>
<div class="poster-body">
<WorkPlate variant="grid" tone="violet" code="03" note="11 PANELS" label="面板网格：十几个视图盯着同一段时间" />
<div class="poster-main">
<dl class="poster-metrics">
<div><dt>面板</dt><dd>11<span>个</span></dd></div>
<div><dt>功能</dt><dd>10<span>种</span></dd></div>
<div><dt>加载</dt><dd>2<span>倍</span></dd></div>
<div><dt>EDR 变体</dt><dd>2<span>种</span></dd></div>
</dl>
<p class="poster-lead">从零开始写的行车数据分析工具，独立开发。在这之前，大家看一段行车数据的方式是打开 csv 逐行翻；现在把数采包（目录或 zip）丢进去，多路 CSV 按每个功能自己的时间戳规则对齐成「一帧一行」，一个窗口里十一个面板跟着时间轴一起走——3D、Graph、Video、Struct、Info、Control、Object、Event、Lane、Table、Segment。</p>
<div class="poster-more">
<ul>
<li>覆盖 ACC / LCA / HWA / P2P / AEB / LDW / LKA / ELK / FCW / FDM 十种功能，另有 HWA / P2P 的 EDR 变体</li>
<li>3D 场景用 pyqtgraph 的 OpenGL 画，车道线、规划路径、感知与预测目标、高精地图共用一个坐标系；目标框绕底边旋转，虚线车道线也是自写的图元</li>
<li>视频不做解码：bin 里的图像帧逐帧取出，OpenCV 把感知图元叠上去，再按时间戳查字典直接取帧</li>
<li>加载阶段线程池并行读 CSV、多进程处理图像；3D 图元启动时一次建好，回放时只更新数据</li>
<li>同等数据量下，加载速度大约是算法供应商那套工具的两倍</li>
</ul>
</div>
</div>
</div>
<button class="poster-toggle" type="button" aria-expanded="false"><span>展开 5 条详情</span></button>
</article>

<article class="work-poster">
<p class="poster-kind">工具链 · TOOLCHAIN</p>
<h3 id="multi-format-parser" class="poster-title">多格式车载数据解析工具<span class="poster-sub">一个入口读所有格式</span></h3>
<p class="entry-meta">Python · PySide6 · PyQtGraph · asammdf · cantools / canmatrix · python-can · dpkt · NumPy · Pandas · PyInstaller · PyArmor</p>
<div class="poster-body">
<WorkPlate variant="stack" tone="cyan" code="04" note="MF4 · BLF · PCAP" label="层叠：各种格式进同一个入口" />
<div class="poster-main">
<dl class="poster-metrics">
<div><dt>业务代码</dt><dd>2<span>万行</span></dd></div>
<div><dt>格式</dt><dd>7<span>类</span></dd></div>
<div><dt>界面</dt><dd>双语</dd></div>
<div><dt>分发</dt><dd>单文件</dd></div>
</dl>
<p class="poster-lead">各家供应商、各个项目导出的数据格式都不一样。分析时最烦的往往不是看不懂曲线，而是得先把 mf4、blf、csv、pcap 这些文件分别用不同的工具打开。这个工具只做一个入口：不管数据是什么格式、走的哪条总线，读进来都在同一张表和一排曲线里对照着看。</p>
<div class="poster-more">
<ul>
<li>支持 mf4/mdf、blf/asc、csv、pcap、bin（按 C 结构体定义解析）、设备日志、dbc/arxml 等格式</li>
<li>多路 DBC 并行解码、通道自动检测；信号表与曲线联动，基准线 / 测量线做差分读数、Go To X 按时间或帧跳转、Search Y 反查某个值出现在第几帧——以前这些只能进 CANoe Graphics 里看</li>
<li>顺手把它做成了格式转换的入口：arxml ↔ dbc 互转、mf4 按时间裁剪、DBC 导出 Excel</li>
<li>新项目的报文各写一份解析器接入（UDP 抓包、SOME/IP、C 结构体三种形态），一个项目一个目录</li>
<li>读 pcap 时先扫一遍包数再解析，用来推进度；同时会检测时间戳倒流这类脏数据</li>
<li>业务代码约两万行，中英双语界面，加密后打成单文件分发</li>
</ul>
</div>
</div>
</div>
<button class="poster-toggle" type="button" aria-expanded="false"><span>展开 6 条详情</span></button>
</article>

<article class="work-poster">
<p class="poster-kind">工具链 · TOOLCHAIN</p>
<h3 id="dssad-tool" class="poster-title">自动驾驶数据记录系统工具<span class="poster-sub">GB 44497-2024 · 桌面 + Web</span></h3>
<p class="entry-meta">桌面端 —— Python · PySide6 · PyQtGraph · DoIP / UDS · NumPy · PyArmor</p>
<p class="entry-meta">Web 端 —— Flask · Celery · PostgreSQL · Redis · React · Ant Design</p>
<div class="poster-body">
<WorkPlate variant="pulse" tone="violet" code="05" note="DOIP · UDS" label="脉冲：一条诊断链路里的一次会话" />
<div class="poster-main">
<dl class="poster-metrics">
<div><dt>UDS 服务</dt><dd>9<span>项</span></dd></div>
<div><dt>渗透修复</dt><dd>16<span>项</span></dd></div>
<div><dt>端</dt><dd>2<span>套</span></dd></div>
<div><dt>留痕</dt><dd>本地 + 云</dd></div>
</dl>
<p class="poster-lead">按 GB 44497-2024 的要求，把数据记录设备里的事件数据取出来看。设备侧只留了 DoIP/UDS 一条路，所以整条诊断链路是自己实现了一遍；取回来的事件、目标物、信号曲线和摄像头视频要能在同一条时间轴上对着看。外面还配了一套 Web 管理端：桌面端干活，Web 端管账号、权限和操作留痕。</p>
<div class="poster-more">
<ul>
<li>实现的 UDS 服务：0x10 会话、0x3E 保活、0x31 例程（数据整合与 CRC 校验）、0x22 读 DID、0x27 安全访问、0x29 认证（证书挑战 + 签名）、0x38 / 0x36 / 0x37 文件传输，含 NRC 0x78 轮询</li>
<li>在线从设备下载事件数据与视频；离线直接打开导出的 JSON 和配套视频回放</li>
<li>事件、目标物、信号曲线、视频共用一条时间轴，拖游标时三边同步</li>
<li>操作留痕先写本地 SQLite，联网后补传云端，账号权限与云端共用一套</li>
<li>Web 管理端：账号 / 角色 / 工具权限 / 操作日志 / 看板，Docker Compose 一套起</li>
<li>上线前自己跑了一轮渗透测试，16 项问题逐条修完，涵盖硬编码密钥、调试器暴露、依赖 CVE、用户名枚举、越权这几类</li>
</ul>
</div>
</div>
</div>
<button class="poster-toggle" type="button" aria-expanded="false"><span>展开 6 条详情</span></button>
</article>

<article class="work-poster">
<p class="poster-kind">工具链 · TOOLCHAIN</p>
<h3 id="radar-4d" class="poster-title">4D 毫米波雷达可视化系统<span class="poster-sub">点云 / 目标 · 实时 / 离线</span></h3>
<p class="entry-meta">Python · PySide6 · PyQtGraph OpenGL · NumPy · dpkt · OpenCV · typer / rich · PyInstaller · PyArmor</p>
<div class="poster-body">
<WorkPlate variant="cloud" tone="cyan" code="06" note="20 HZ · RT / OFFLINE" label="点云：一簇散点里只有一个确定的目标" />
<div class="poster-main">
<dl class="poster-metrics">
<div><dt>刷新</dt><dd>20<span>Hz</span></dd></div>
<div><dt>点云</dt><dd>3000<span>点</span></dd></div>
<div><dt>目标</dt><dd>200<span>个</span></dd></div>
<div><dt>报文</dt><dd>4<span>类</span></dd></div>
</dl>
<p class="poster-lead">做 4D 毫米波雷达时，台架和实车上采下来的数据得当场看出问题：点云塌没塌、目标跟踪跳不跳、丢包丢在哪一帧。这个工具把实时采集和离线回放做成了一套东西——两种模式共用一条渲染管线，实时看到的画面和回放出来的是一部片子。</p>
<div class="poster-more">
<ul>
<li>解析 UDP 载荷里的交互头与应用头，点云 / 目标 / 状态 / 车辆信息四类报文，做 CRC16 校验、分包重组与物理值换算</li>
<li>落盘成定长 TLV 帧（1456 字节头 + 3000 个点 × 32 字节 + 200 个目标 × 104 字节），异步分片轮转写，另存一份时间戳文件</li>
<li>回放时扫魔数建帧索引，与实时模式共用同一套渲染管线，20Hz 刷新</li>
<li>三维点云用 pyqtgraph 的 OpenGL 视图，二维视图是自己写的图元，两边读同一份数据</li>
<li>丢包检测按 rolling counter 的连续性算：差值落在 2~10 之间计为丢包，更大的当作计数回绕放过</li>
<li>面板铺满一屏：模式切换、文件、状态、协议头、车身信息、点云与目标表格、以太网监控、2D/3D、多路摄像头网格</li>
<li>带一套 CLI，不接图形界面也能采集和批量转 CSV，适合无人值守跑</li>
<li>附带模拟数据源：读一份 pcap 按原时间戳发包，不接硬件也能调界面</li>
</ul>
</div>
</div>
</div>
<button class="poster-toggle" type="button" aria-expanded="false"><span>展开 8 条详情</span></button>
</article>

<article class="work-poster">
<p class="poster-kind">个人项目 · SIDE PROJECT</p>
<h3 id="bricks" class="poster-title">Bricks<span class="poster-sub">多格式数据解析框架</span></h3>
<p class="entry-meta">技术栈 —— Python 3.10+ · 核心零依赖 · Typer / Rich · MCP · pytest + ruff + mypy · GitHub Actions</p>
<p class="entry-meta">状态 —— 开发中，仓库尚未公开，也未发布到 PyPI</p>
<div class="poster-body">
<WorkPlate variant="blocks" tone="violet" code="07" note="32 PARSERS" label="积木：装上一块就能解析一种格式" />
<div class="poster-main">
<dl class="poster-metrics">
<div><dt>包</dt><dd>1.4<span>万行</span></dd></div>
<div><dt>解析器</dt><dd>32<span>个</span></dd></div>
<div><dt>测试</dt><dd>2900<span>行</span></dd></div>
<div><dt>用例</dt><dd>265<span>个</span></dd></div>
</dl>
<p class="poster-lead">像搭积木一样解析数据：每种格式一个解析器，装上就能自动认格式、按需装扩展、串成管道，也能直接被 AI Agent 调用。</p>
<div class="poster-more">
<div>
<p>核心就两块：一个抽象的 <code>Brick</code>（只负责把字节变成结构化数据）和一个注册中心（按名称、扩展名、MIME 找解析器）。其余都能拆开换：</p>
<ul>
<li>格式嗅探分四级：显式指定 → 扩展名 → 魔数 → 内容探测</li>
<li>核心零依赖，汽车、大数据、科学计算、序列化、文档、机器人、网络、AI 八块领域解析器都在 extras 里，用哪个装哪个</li>
<li>解析之外另配了清洗（<code>DataCleaner</code> 链式调用）、验证（规则引擎与 JSON Schema 两条路）、性能工具（并行解析 / 内存映射 / 性能剖析）</li>
<li>五个汽车解析器是顺着工作来的：MF4 把同一份文件里的 XCP 标定信号与 CAN 报文按物理形态拆开，BLF / ASC 能联合 DBC 解码</li>
</ul>
<p>面向 Agent 的那一半是我更想做的：CLI 在非 TTY 环境或带 <code>--json</code> 时输出统一信封（<code>schema_version</code> / <code>ok</code> / <code>result</code> / <code>warnings</code> / <code>errors</code> / <code>metrics</code>），错误码固定、退出码有语义，<code>--sample</code> / <code>--fields</code> / <code>--max-rows</code> 控制输出体积，数据走 stdout、诊断走 stderr。另有 MCP 服务器，把嗅探、解析、画像、Schema 推断等八个能力交给 Claude Code、Cursor 这类客户端；仓库里还带了三份 <code>SKILL.md</code>（数据解析、数据质量、汽车数据），装上就按约定的流程用。</p>
</div>
</div>
</div>
</div>
<button class="poster-toggle" type="button" aria-expanded="false"><span>展开全文</span></button>
</article>

<article class="work-poster">
<p class="poster-kind">个人项目 · SIDE PROJECT</p>
<h3 id="dotfiles" class="poster-title">dotfiles<span class="poster-sub">macOS 个人配置仓库</span></h3>
<p class="entry-meta">技术栈 —— Fish + Lua + Bash + Homebrew（Brewfile）+ GitHub Actions</p>
<p class="entry-meta">状态 —— 长期维护</p>
<p class="entry-meta">链接 —— <a href="https://github.com/fluxixix/dotfiles">github.com/fluxixix/dotfiles</a></p>
<div class="poster-body">
<WorkPlate variant="nodes" tone="cyan" code="08" note="~/.CONFIG" label="节点网络：配置目录之间的软链接" />
<div class="poster-main">
<dl class="poster-metrics">
<div><dt>配置</dt><dd>4<span>套</span></dd></div>
<div><dt>部署</dt><dd>2<span>条命令</span></dd></div>
<div><dt>CI</dt><dd>arm64</dd></div>
<div><dt>状态</dt><dd>长期</dd></div>
</dl>
<p class="poster-lead">macOS 个人配置仓库。手写配置进仓库，插件、主题和补全交给各自的包管理器恢复；部署时每个工具目录软链接到 <code>~/.config</code>，换新电脑两条命令搬完。</p>
<div class="poster-more">
<p>核心约束是「仓库只放手写配置」：Neovim 插件、Yazi 风味、Fish 补全这类由包管理器分发的东西一律不入库。代价是首次部署多几步，换来的是 <code>git log</code> 里只有自己的改动。CI 会在 arm64 macOS runner 上跑静态检查与一致性校验，并用假 <code>HOME</code> 把部署脚本完整演一遍。</p>
</div>
</div>
</div>
<button class="poster-toggle" type="button" aria-expanded="false"><span>展开全文</span></button>
</article>

<article class="work-poster">
<p class="poster-kind">个人项目 · SIDE PROJECT</p>
<h3 id="this-site" class="poster-title">本站<span class="poster-sub">VitePress 个人站</span></h3>
<p class="entry-meta">技术栈 —— VitePress + TypeScript + GitHub Actions</p>
<p class="entry-meta">状态 —— 长期维护</p>
<p class="entry-meta">链接 —— <a href="https://fluxixix.github.io">fluxixix.github.io</a></p>
<div class="poster-body">
<WorkPlate variant="frame" tone="violet" code="09" note="FLUXIXIX.GITHUB.IO" label="页面框架：栏目、栏线、一块内容" />
<div class="poster-main">
<dl class="poster-metrics">
<div><dt>技术栈</dt><dd>3<span>项</span></dd></div>
<div><dt>主题</dt><dd>自研</dd></div>
<div><dt>部署</dt><dd>推送即发布</dd></div>
<div><dt>内容</dt><dd>全 Markdown</dd></div>
</dl>
<p class="poster-lead">这个站点本身也算一个项目：VitePress + 自定义主题，文章全部是 Markdown，推送到 GitHub 自动构建发布。</p>
</div>
</div>
</article>

<article class="work-poster">
<p class="poster-kind">个人项目 · SIDE PROJECT</p>
<h3 id="vitepress-theme" class="poster-title">vitepress-theme-fluxixix<span class="poster-sub">VitePress 编辑部式主题</span></h3>
<p class="entry-meta">技术栈 —— Vue 3 · TypeScript · 纯 CSS · VitePress 2 alpha · Node 24</p>
<p class="entry-meta">状态 —— v0.3.0 · MIT · 不上 npm registry</p>
<p class="entry-meta">链接 —— <a href="https://github.com/fluxixix/vitepress-theme-fluxixix">github.com/fluxixix/vitepress-theme-fluxixix</a></p>
<div class="poster-body">
<WorkPlate variant="stack" tone="cyan" code="10" note="17 STYLE SHEETS" label="层叠：十七册样式叠在默认主题之上，顺序不能反" />
<div class="poster-main">
<dl class="poster-metrics">
<div><dt>样式</dt><dd>17<span>册</span></dd></div>
<div><dt>组件</dt><dd>6<span>个</span></dd></div>
<div><dt>检查</dt><dd>4<span>道</span></dd></div>
<div><dt>分发</dt><dd>纯源码</dd></div>
</dl>
<p class="poster-lead">本站用的版式抽成了一个独立的主题包，从 GitHub 装到别的 VitePress 站上。它只在默认主题上叠一层，不替换它：没启用的页面形态一个节点都不产出，宿主站自己的 CSS 照样压得住。</p>
<div class="poster-more">
<ul>
<li>形态都由页面自己触发。<code>pageClass</code> 写 archive / now-index / works / about 才长出对应的版式，frontmatter 写 <code>masthead: true</code> 才多出编辑体页头。不写就什么也不多。</li>
<li>样式不写 <code>@layer</code>，是试出来的。默认主题的 <code>vars.css</code> 和组件的 <code>&lt;style scoped&gt;</code> 都没分层，主题一旦进层就被反压，品牌色、悬浮导航胶囊、阅读进度环会同时失守，还不报错。所以它靠排在默认主题之后取胜。</li>
<li>只发 GitHub，不上 npm registry，git tag 就是版本。安装的坑有三条，都写进文档了：必须写 <code>git+https://</code>，<code>github:</code> 简写会被解析成 ssh 写进 lockfile，CI 上没有私钥直接失败；npm 12 起 git 依赖默认被拦，要放行一次；没装 git 的机器只能走 Release 挂的 tgz。</li>
<li>有个坑只在别人机器上炸。<code>/site</code> 和 <code>/rss</code> 由站点配置文件引入，运行时归 Node 加载，而 Node 不对 <code>node_modules</code> 做类型剥离，入口指向 <code>.ts</code> 时外部用户 <code>vitepress build</code> 第一步就抛 <code>ERR_UNSUPPORTED_NODE_MODULES_TYPE_STRIPPING</code>。仓库里是符号链接布局，看不见这个问题，于是加了一道打包冒烟：把 <code>npm pack</code> 出的 tgz 解成真目录，再建一个最小站点装上去。CI 跑完四道检查才发版。</li>
<li>另带一个零依赖脚手架，一条 <code>npx … init my-blog</code> 就能生成能跑的站点，站里带 <code>.npmrc</code>，之后的 <code>npm install</code> 不用再带 flag。</li>
</ul>
</div>
</div>
</div>
<button class="poster-toggle" type="button" aria-expanded="false"><span>展开 5 条详情</span></button>
</article>
