package main

import (
	"embed"
	"log"
	"os"

	"github.com/wailsapp/wails/v3/pkg/application"
	"github.com/wailsapp/wails/v3/pkg/events"
)

//go:embed all:frontend/dist
var assets embed.FS

func init() {
	application.RegisterEvent[ExecutionEvent]("execution:log")
	application.RegisterEvent[int64]("execution:open-log")
	application.RegisterEvent[[]string]("files:dropped")
}

func main() {
	// 双模式： `scriptlauncher mcp` 以 stdio 启动 MCP 服务器（供 AI 调用），
	// 否则正常启动桌面 GUI。两种模式复用同一套 LauncherService 与 SQLite 库。
	if len(os.Args) > 1 && os.Args[1] == "mcp" {
		if err := runMCPServer(); err != nil {
			log.Fatal(err)
		}
		return
	}

	service, err := NewLauncherService()
	if err != nil {
		log.Fatal(err)
	}
	defer service.close()

	app := application.New(application.Options{
		Name:        "Script Launcher",
		Description: "统一管理和执行本地脚本、程序及常用命令",
		Services: []application.Service{
			application.NewService(service),
		},
		Assets: application.AssetOptions{
			Handler: application.AssetFileServerFS(assets),
		},
		Mac: application.MacOptions{
			ApplicationShouldTerminateAfterLastWindowClosed: true,
		},
	})
	service.setApp(app)

	window := app.Window.NewWithOptions(application.WebviewWindowOptions{
		Title:     "Script Launcher",
		Width:     1180,
		Height:    760,
		MinWidth:  860,
		MinHeight: 560,
		EnableFileDrop: true,
		Mac: application.MacWindow{
			InvisibleTitleBarHeight: 50,
			TitleBar:                application.MacTitleBarHiddenInset,
		},
		BackgroundColour: application.NewRGB(255, 255, 255),
		URL:              "/",
	})
	service.notifications = newExecutionNotifications(app, window)

	window.OnWindowEvent(events.Common.WindowFilesDropped, func(event *application.WindowEvent) {
		files := event.Context().DroppedFiles()
		if len(files) > 0 {
			app.Event.Emit("files:dropped", files)
		}
	})

	if err := app.Run(); err != nil {
		log.Fatal(err)
	}
}
