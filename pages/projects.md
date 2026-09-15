---
title: 项目
pageClass: projects
# 页头由 PageMasthead 生成（与关于页同一套语言），正文里不再重复写标题
masthead: true
name: 作品
tag: 项目 · WORKS
meta: 工具链 · 个人项目 · 技术栈
---

做过和在做的东西，末尾附上日常在用的技术栈。

## 平台

企业级的平台，前后端一体，是我花时间最多、也最满意的一个项目。前面那些工具解决的是「一个人怎么把数据看明白」，这个解决的是「几百号人的东西怎么交出去、怎么被找到、怎么迭代」。

### Flux Studio · 软件与 AI 资产平台

<p class="entry-meta">前端 —— Next.js 15 · React 19 · TypeScript · Tailwind · TanStack Query · Zustand · D3 · three.js</p>

<p class="entry-meta">后端 —— Python · Flask · SQLAlchemy · PostgreSQL · Redis · Celery · JWT / IAM SSO · Docker Compose</p>

Admin 管理后台 + Portal 用户门户两套前端共用一个后端。软件上架、版本与授权分发、下载审计是一条线；AI 资产的提交、审核、发布、一键安装是另一条线；再加一张把「领域 → 子领域 → 技能」逐项认领到团队的技能树，部门 AI 化进度第一次有了统一口径。后端约 2.75 万行、前端约 3.4 万行，另配 1.8 万行 pytest。

- 后端 255 个接口、39 张表，按 admin / dev / portal 三域分成「路由 → 服务 → 模型」三层，跨域模型用类型前置引用拆掉循环导入
- 权限不采信 token：JWT 双 token（60 分钟 / 7 天）配 Redis 黑名单，但角色与权限每次请求从库里现查——改完权限立刻生效，不用等 token 过期；381 处细粒度权限点；对外接口用 API Key，secret 走 bcrypt，带 IP 白名单与过期时间
- 每个请求同时落两张审计表：操作日志 + 接口调用统计（含毫秒耗时），用独立 session 提交，不污染主请求事务
- 9 个 Celery 任务把提交、审核、发布、反馈通知全部异步化——否则一个请求要等飞书接口十秒；Beat 每天 09:30 扫技能截止倒计时，任务配 acks_late，worker 崩了能重投
- AI 资产包解析：zip / tar / 7z / rar 八种格式解包、文件树扫描、37 种语言的代码预览，检查结果写进审核记录；审核页左右分栏可拖拽，左边文件树右边带行号预览
- 一键安装：按资产类型与目标 AI Agent 动态生成 PowerShell 安装脚本
- 状态机与跨域联动是最费脑子的部分：AI 条目 9 个状态、技能项 4 个状态，审核通过要同步改技能项状态，取消认领要级联删掉关联条目及其全部版本与审核记录
- 前端是 Next.js 15 App Router 的双端单体：自建 12 个 UI 原语，暗色切换用 View Transitions 做圆形揭示；技能树是一张 D3 力导向图，节点可缩放拖拽、点开抽屉走认领与攻坚；另有 three.js 星空背景与 canvas 光标
- 一个 docker compose 起七个服务（nginx、前端、后端、worker、beat、PostgreSQL 16、Redis）：nginx 统一入口并给静态资源长缓存；启动脚本自动生成随机密钥，备份脚本 pg_dump + 压缩 + 异地同步

## 工具链

工作里自己做的一套汽车电子数据工具，从解析、回放到可视化。它们其实在解同一个问题：车上采下来的数据，得有人在几秒钟内看明白。这部分写得细一些，因为这是这几年最花心思的地方。

### 低速行泊数据回放系统

<p class="entry-meta">Python · PyQt5 · PyQtGraph · asammdf · cantools / python-can · OpenCV · NumPy · Pandas · PyInstaller · PyArmor</p>

公司第一套自研的行泊数据回放工具。APA、MPA、CVP、FTBA 四个功能页签，后来扩出一个 FREE 自由分析页——五个页签共用同一套数据层与绘图函数，加一个功能只写它自己那部分；曲线、俯视场景图与视频挂在同一条时间轴上。

- 文件加载、数据解析、图形初始化平均 0.3s 完成，比供应商的工具快一个量级
- 读 mf4 时一次性把用到的通道全部取出来常驻内存，回放只做查表切片；帧率不一致的变量自动重采样到 20ms 再按时间戳对齐
- 俯视图里的车位、超声波雷达点、视觉目标都是建好的图元，回放时只切可见性，不重新创建
- 除 mf4/mdf 外还能读 blf 与 DBC/arxml，视频按时间戳直接跳帧，不逐帧解码
- 用 PyInstaller 打成单个可执行文件，全平台通用，双击就能跑，不要求对方装 Python
- 一年里支撑了多个主机厂项目的数据分析

### 高速行车 3D 可视化系统

<p class="entry-meta">Python · PySide6 · PyQtGraph OpenGL · OpenCV · protobuf · NumPy · Pandas · PyInstaller · PyArmor</p>

从零开始写的行车数据分析工具，独立开发。在这之前，大家看一段行车数据的方式是打开 csv 逐行翻；现在把数采包（目录或 zip）丢进去，多路 CSV 按每个功能自己的时间戳规则对齐成「一帧一行」，一个窗口里十一个面板跟着时间轴一起走——3D、Graph、Video、Struct、Info、Control、Object、Event、Lane、Table、Segment。

- 覆盖 ACC / LCA / HWA / P2P / AEB / LDW / LKA / ELK / FCW / FDM 十种功能，另有 HWA / P2P 的 EDR 变体
- 3D 场景用 pyqtgraph 的 OpenGL 画，车道线、规划路径、感知与预测目标、高精地图共用一个坐标系；目标框绕底边旋转，虚线车道线也是自写的图元
- 视频不做解码：bin 里的图像帧逐帧取出，OpenCV 把感知图元叠上去，再按时间戳查字典直接取帧
- 加载阶段线程池并行读 CSV、多进程处理图像；3D 图元启动时一次建好，回放时只更新数据
- 同等数据量下，加载速度大约是算法供应商那套工具的两倍

### 多格式车载数据解析工具

<p class="entry-meta">Python · PySide6 · PyQtGraph · asammdf · cantools / canmatrix · python-can · dpkt · NumPy · Pandas · PyInstaller · PyArmor</p>

各家供应商、各个项目导出的数据格式都不一样。分析时最烦的往往不是看不懂曲线，而是得先把 mf4、blf、csv、pcap 这些文件分别用不同的工具打开。这个工具只做一个入口：不管数据是什么格式、走的哪条总线，读进来都在同一张表和一排曲线里对照着看。

- 支持 mf4/mdf、blf/asc、csv、pcap、bin（按 C 结构体定义解析）、设备日志、dbc/arxml 等格式
- 多路 DBC 并行解码、通道自动检测；信号表与曲线联动，基准线 / 测量线做差分读数、Go To X 按时间或帧跳转、Search Y 反查某个值出现在第几帧——以前这些只能进 CANoe Graphics 里看
- 顺手把它做成了格式转换的入口：arxml ↔ dbc 互转、mf4 按时间裁剪、DBC 导出 Excel
- 新项目的报文各写一份解析器接入（UDP 抓包、SOME/IP、C 结构体三种形态），一个项目一个目录
- 读 pcap 时先扫一遍包数再解析，用来推进度；同时会检测时间戳倒流这类脏数据
- 业务代码约两万行，中英双语界面，加密后打成单文件分发

### 自动驾驶数据记录系统工具

<p class="entry-meta">桌面端 —— Python · PySide6 · PyQtGraph · DoIP / UDS · NumPy · PyArmor</p>

<p class="entry-meta">Web 端 —— Flask · Celery · PostgreSQL · Redis · React · Ant Design</p>

按 GB 44497-2024 的要求，把数据记录设备里的事件数据取出来看。设备侧只留了 DoIP/UDS 一条路，所以整条诊断链路是自己实现了一遍；取回来的事件、目标物、信号曲线和摄像头视频要能在同一条时间轴上对着看。外面还配了一套 Web 管理端：桌面端干活，Web 端管账号、权限和操作留痕。

- 实现的 UDS 服务：0x10 会话、0x3E 保活、0x31 例程（数据整合与 CRC 校验）、0x22 读 DID、0x27 安全访问、0x29 认证（证书挑战 + 签名）、0x38 / 0x36 / 0x37 文件传输，含 NRC 0x78 轮询
- 在线从设备下载事件数据与视频；离线直接打开导出的 JSON 和配套视频回放
- 事件、目标物、信号曲线、视频共用一条时间轴，拖游标时三边同步
- 操作留痕先写本地 SQLite，联网后补传云端，账号权限与云端共用一套
- Web 管理端：账号 / 角色 / 工具权限 / 操作日志 / 看板，Docker Compose 一套起
- 上线前自己跑了一轮渗透测试，16 项问题逐条修完，涵盖硬编码密钥、调试器暴露、依赖 CVE、用户名枚举、越权这几类

### 4D毫米波雷达 · 点云/目标 · 实时/离线 · 三维可视化系统

<p class="entry-meta">Python · PySide6 · PyQtGraph OpenGL · NumPy · dpkt · OpenCV · typer / rich · PyInstaller · PyArmor</p>

做 4D 毫米波雷达时，台架和实车上采下来的数据得当场看出问题：点云塌没塌、目标跟踪跳不跳、丢包丢在哪一帧。这个工具把实时采集和离线回放做成了一套东西——两种模式共用一条渲染管线，实时看到的画面和回放出来的是一部片子。

- 解析 UDP 载荷里的交互头与应用头，点云 / 目标 / 状态 / 车辆信息四类报文，做 CRC16 校验、分包重组与物理值换算
- 落盘成定长 TLV 帧（1456 字节头 + 3000 个点 × 32 字节 + 200 个目标 × 104 字节），异步分片轮转写，另存一份时间戳文件
- 回放时扫魔数建帧索引，与实时模式共用同一套渲染管线，20Hz 刷新
- 三维点云用 pyqtgraph 的 OpenGL 视图，二维视图是自己写的图元，两边读同一份数据
- 丢包检测按 rolling counter 的连续性算：差值落在 2~10 之间计为丢包，更大的当作计数回绕放过
- 面板铺满一屏：模式切换、文件、状态、协议头、车身信息、点云与目标表格、以太网监控、2D/3D、多路摄像头网格
- 带一套 CLI，不接图形界面也能采集和批量转 CSV，适合无人值守跑
- 附带模拟数据源：读一份 pcap 按原时间戳发包，不接硬件也能调界面

### 顺带写的十几款小工具

桌面端开发是自学的，没什么捷径，就是问题来了一个个解决。

## 个人项目

### dotfiles

macOS 个人配置仓库。手写配置进仓库，插件、主题和补全交给各自的包管理器恢复；部署时每个工具目录软链接到 `~/.config`，换新电脑两条命令搬完。

- 技术栈：Fish + Lua + Bash + Homebrew（Brewfile）+ GitHub Actions
- 状态：长期维护
- 链接：[github.com/fluxixix/dotfiles](https://github.com/fluxixix/dotfiles)

核心约束是「仓库只放手写配置」：Neovim 插件、Yazi 风味、Fish 补全这类由包管理器分发的东西一律不入库。代价是首次部署多几步，换来的是 `git log` 里只有自己的改动。CI 会在 arm64 macOS runner 上跑静态检查与一致性校验，并用假 `HOME` 把部署脚本完整演一遍。

### 本站

这个站点本身也算一个项目：VitePress + 自定义主题，文章全部是 Markdown，推送到 GitHub 自动构建发布。

- 技术栈：VitePress + TypeScript + GitHub Actions
- 状态：长期维护
- 链接：[fluxixix.github.io](https://fluxixix.github.io)

## 技术栈

只记录当下真实的取舍，不追求大而全。

### 语言

- **C/C++** —— 嵌入式
- **Python** —— 主力
- **看得懂、不太会写** —— Go、Rust、TypeScript

### 框架与库

- **前端** —— Vue 3、React、Vite、Node.js；只会用，不会写
- **后端** —— Flask；只会用的：FastAPI、Django
- **桌面端** —— C++/Qt、PySide6、pyqtgraph、qfluentwidgets

### 开发工具

- **VS Code** —— 主力编辑器
- **PyCharm** —— 以前的 Python 主力 IDE，太重了
- **Git** —— 版本控制

### 正在了解

- **Rust** —— 想搞明白那些工具为什么快
- **Tauri** —— 用它替代 Electron 写桌面端
