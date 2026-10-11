# ScriptLauncher AI

<p align="center">
  <img src="frontend/public/script-launcher-logo.png" width="88" alt="ScriptLauncher logo" />
</p>

<p align="center"><strong>人机共用的现代 AI-Native 桌面脚本启动器与自动化中枢。</strong><br />A lightweight, local-first desktop script launcher with Model Context Protocol (MCP) support & Linear-style UI.</p>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="MIT license" /></a>
  <img src="https://img.shields.io/badge/MCP-Ready-8b93e8" alt="MCP Ready" />
  <img src="https://img.shields.io/badge/platform-Windows%20%7C%20macOS-lightgrey" alt="Windows and macOS" />
</p>

---

## 🌟 核心亮点

* 🤖 **AI-Native MCP 原生赋能**：内置 Model Context Protocol (MCP) 服务器，暴露 10 个标准化工具接口，让 Claude Desktop、Cursor、Antigravity 等 AI 智能体在对话中即可自主读取、编排与执行本地脚本任务。
* 🎨 **Linear / Vercel 极简设计**：基于现代前端设计语言全面重绘，清爽克制、细腻动效，支持深浅色主题自适应。
* 🔄 **SQLite WAL 双模并发**：桌面 GUI 界面与后台 MCP 守护进程共用同一个 SQLite 数据库（WAL 并发模式），人手配置与 AI 操作实时打通。
* ⚡ **极速轻量**：Go + Wails 架构编译为单一独立二进制文件，毫秒级冷启动，内存占用低，免配复杂运行时。
* 🛠️ **多语言解释器自动路由**：根据文件后缀自动调度 Python (`.py`)、PowerShell (`.ps1`)、Node.js (`.js`)、Batch (`.bat`)、Shell 以及系统 PATH 中的任意命令。

---

## 🚀 两种运行模式

| 模式 | 运行命令 | 说明 |
| :--- | :--- | :--- |
| **桌面 GUI 模式** | `ScriptLauncher.exe` | 正常打开可视化操作面板，管理脚本卡片与查看实时执行日志 |
| **MCP 服务模式** | `ScriptLauncher.exe mcp` | 以 `stdio` 协议启动 MCP 服务，供各大 AI 宿主模型直接调用 |

---

## 🔌 在各 AI 客户端中接入 (MCP Config)

统一配置代码：

```json
{
  "mcpServers": {
    "script-launcher": {
      "command": "/path/to/ScriptLauncher.exe",
      "args": ["mcp"]
    }
  }
}
```

### 1. Antigravity
在 `~/.gemini/config/mcp_config.json` 中添加上述段落并重启即可。

### 2. Claude Desktop
编辑 `%APPDATA%\Claude\claude_desktop_config.json`，合并 `mcpServers` 配置段并重启 Claude。

### 3. Cursor
在项目根目录 `.cursor/mcp.json` 或全局 MCP 设置中粘贴同样的配置。

### 4. QwenWork（千问办公）
打开设置 → 连接器 → 自定义 MCP → 添加，粘贴上方 JSON。

---

## 📦 下载与安装

请前往 [GitHub Releases](https://github.com/1264585648/ScriptLauncher-AI/releases) 下载最新预编译包：

* **Windows 10 / 11 (64-bit)**：下载 `ScriptLauncher-AI-v0.0.3-windows-amd64.zip`，解压即用。
* *系统要求：系统内置 Microsoft Edge WebView2 Runtime。*

---

## 🛠️ 本地重新构建

源码依赖：Go 1.24+、Node.js 20+、pnpm、Wails v3 CLI。

```bash
# 1. 安装前端依赖
cd frontend && pnpm install && cd ..

# 2. 构建产物
wails3 build
```
产物将输出在 `bin/scriptlauncher.exe`。

---

## 📄 开源许可与致谢

* 本项目基于开源项目 **[lemon-codehub/ScriptLauncher](https://github.com/lemon-codehub/ScriptLauncher)**（MIT License）深度二次开发；
* 本项目同样采用 [MIT 许可证](LICENSE) 完全开源，保留原作者版权声明并致谢开源社区的贡献。
