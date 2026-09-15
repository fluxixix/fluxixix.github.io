---
title: 项目
pageClass: projects
---

# 项目

做过和在做的东西，末尾附上日常在用的技术栈。

## 工具链

工作里自己做的一套汽车电子数据工具，从解析、回放到可视化。它们其实在解同一个问题：车上采下来的数据，得有人在几秒钟内看明白。这部分写得细一些，因为这是这几年最花心思的地方。

### 低速行泊数据回放系统

<p class="entry-meta">Python · PyQt5 · PyQtGraph · PyInstaller</p>

公司第一套自研的行泊数据回放工具。支持 APA / HPP / CVP / FTBA，顺手补上了以前只能进 CANoe 里看的 XCP / CAN 图表分析——对不需要整套 CANoe 的同事来说，这部分最省事。

- 文件加载、数据解析、图形初始化平均 0.3s 完成，比供应商的工具快一个量级
- 用 PyInstaller 打成单个可执行文件，全平台通用，双击就能跑，不要求对方装 Python
- 一年里支撑了多个主机厂项目的数据分析

### 高速行车 3D 可视化系统

<p class="entry-meta">Python · PySide6 · PyQtGraph · OpenGL · OpenCV</p>

从零开始写的行车数据分析工具，独立开发。在这之前，大家看一段行车数据的方式是打开 csv 逐行翻；现在可以在同一个窗口里同步看六个 Panel——Info、3D、Struct、Graph、Video、Control，拖动时间轴，图形、图表和视频跟着一起走。

- 覆盖 ACC / LCA / HWA / P2P / AEB / LDW / LKA / ELK / FCW / FDM 等功能的回放
- 3D 场景用 OpenGL 画，视频用 OpenCV 解码，和曲线图表共用同一条时间轴
- 同等数据量下，加载速度大约是算法供应商那套工具的两倍

### 多格式车载数据解析工具

<p class="entry-meta">Python · PySide6 · PyQtGraph · asammdf · cantools / canmatrix · dpkt</p>

各家供应商、各个项目导出的数据格式都不一样。分析时最烦的往往不是看不懂曲线，而是得先把 mf4、blf、csv、pcap 这些文件分别用不同的工具打开。这个工具只做一个入口：不管数据是什么格式、走的哪条总线，读进来都在同一张表和一排曲线里对照着看。

- 支持 mf4/mdf、blf/asc、csv、pcap、bin（按 C 结构体定义解析）、设备日志、dbc/arxml 等格式
- 多路 DBC 并行解码、通道自动检测；信号表与多张曲线图联动，带基准线、测量线和搜索跳转
- 顺手把它做成了格式转换的入口：arxml ↔ dbc 互转、mf4 按时间裁剪、DBC 导出 Excel
- 新项目的报文用插件方式接入（UDP 抓包、SOME/IP、C 结构体三种形态），加一个目录就是支持一个项目
- 读 pcap 时先扫一遍包数再解析，用来推进度；同时会检测时间戳倒流这类脏数据
- 业务代码约两万行，中英双语界面，加密后打成单文件分发

### 自动驾驶数据记录系统工具

<p class="entry-meta">桌面端 —— Python · PySide6 · PyQtGraph · DoIP / UDS</p>

<p class="entry-meta">Web 端 —— Flask · Celery · PostgreSQL · Redis · React · Ant Design</p>

按 GB 44497-2024 的要求，把数据记录设备里的事件数据取出来看。设备侧只留了 DoIP/UDS 一条路，所以整条诊断链路是自己实现了一遍；取回来的事件、目标物、信号曲线和摄像头视频要能在同一条时间轴上对着看。外面还配了一套 Web 管理端：桌面端干活，Web 端管账号、权限和操作留痕。

- 实现的 UDS 服务：0x10 会话、0x3E 保活、0x31 例程（数据整合与 CRC 校验）、0x22 读 DID、0x27 安全访问、0x29 认证（证书挑战 + 签名）、0x38 / 0x36 / 0x37 文件传输，含 NRC 0x78 轮询
- 在线从设备下载事件数据与视频；离线直接打开导出的 JSON 和配套视频回放
- 事件、目标物、信号曲线、视频共用一条时间轴，拖游标时三边同步
- 操作留痕先写本地 SQLite，联网后补传云端，账号权限与云端共用一套
- Web 管理端：账号 / 角色 / 工具权限 / 操作日志 / 看板，Docker Compose 一套起
- 上线前自己跑了一轮渗透测试，16 项问题逐条修完，涵盖硬编码密钥、调试器暴露、依赖 CVE、用户名枚举、越权这几类

### 4D毫米波雷达 · 点云/目标 · 实时/离线 · 三维可视化系统

<p class="entry-meta">Python · PySide6 · PyQtGraph OpenGL · OpenCV · typer / rich · PyInstaller</p>

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

这个站点本身也算一个项目：VitePress + 自定义主题，文章全部是 Markdown，推送到 main 自动构建发布。

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
