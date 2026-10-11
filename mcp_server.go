package main

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/mark3labs/mcp-go/mcp"
	"github.com/mark3labs/mcp-go/server"
)

// runMCPServer 以 stdio 方式启动 MCP 服务器，复用与 GUI 完全相同的
// LauncherService（同一个 SQLite 库，WAL 模式，可与 GUI 并存）。
// 触发方式： scriptlauncher.exe mcp
func runMCPServer() error {
	service, err := NewLauncherService()
	if err != nil {
		return err
	}
	defer service.close()

	s := server.NewMCPServer(
		"Script Launcher",
		"0.0.3",
		server.WithToolCapabilities(true),
	)
	registerLauncherTools(s, service)
	return server.ServeStdio(s)
}

func jsonText(value any) string {
	encoded, err := json.MarshalIndent(value, "", "  ")
	if err != nil {
		return fmt.Sprintf(`{"error":"结果序列化失败: %v"}`, err)
	}
	return string(encoded)
}

func registerLauncherTools(s *server.MCPServer, svc *LauncherService) {
	// ---------- 读取 ----------
	s.AddTool(
		mcp.NewTool("list_scripts",
			mcp.WithDescription("列出全部分组与脚本入口，返回每个入口的 id、名称、脚本路径、参数、所属分组等。执行增删改或运行脚本前，先用它拿到 id。"),
			mcp.WithReadOnlyHintAnnotation(true),
		),
		func(ctx context.Context, req mcp.CallToolRequest) (*mcp.CallToolResult, error) {
			state, err := svc.GetState()
			if err != nil {
				return mcp.NewToolResultError(err.Error()), nil
			}
			return mcp.NewToolResultText(jsonText(state)), nil
		},
	)

	// ---------- 分组：增 / 改 / 删 ----------
	s.AddTool(
		mcp.NewTool("create_group",
			mcp.WithDescription("新建一个分组，用于归类脚本入口。"),
			mcp.WithString("name", mcp.Required(), mcp.Description("分组名称")),
			mcp.WithString("icon", mcp.Description("图标名（Lucide 名称，如 Folder、Terminal、Database），可选")),
		),
		func(ctx context.Context, req mcp.CallToolRequest) (*mcp.CallToolResult, error) {
			name, err := req.RequireString("name")
			if err != nil {
				return mcp.NewToolResultError(err.Error()), nil
			}
			group, err := svc.CreateGroup(GroupInput{Name: name, Icon: req.GetString("icon", "")})
			if err != nil {
				return mcp.NewToolResultError(err.Error()), nil
			}
			return mcp.NewToolResultText(jsonText(group)), nil
		},
	)

	s.AddTool(
		mcp.NewTool("update_group",
			mcp.WithDescription("修改分组名称或图标。"),
			mcp.WithInteger("id", mcp.Required(), mcp.Description("分组 id")),
			mcp.WithString("name", mcp.Required(), mcp.Description("新的分组名称")),
			mcp.WithString("icon", mcp.Description("新的图标名，可选")),
		),
		func(ctx context.Context, req mcp.CallToolRequest) (*mcp.CallToolResult, error) {
			id, err := req.RequireInt("id")
			if err != nil {
				return mcp.NewToolResultError(err.Error()), nil
			}
			name, err := req.RequireString("name")
			if err != nil {
				return mcp.NewToolResultError(err.Error()), nil
			}
			group, err := svc.UpdateGroup(int64(id), GroupInput{Name: name, Icon: req.GetString("icon", "")})
			if err != nil {
				return mcp.NewToolResultError(err.Error()), nil
			}
			return mcp.NewToolResultText(jsonText(group)), nil
		},
	)

	s.AddTool(
		mcp.NewTool("delete_group",
			mcp.WithDescription("删除分组；该分组下的所有入口会一并删除，不可撤销。"),
			mcp.WithDestructiveHintAnnotation(true),
			mcp.WithInteger("id", mcp.Required(), mcp.Description("分组 id")),
		),
		func(ctx context.Context, req mcp.CallToolRequest) (*mcp.CallToolResult, error) {
			id, err := req.RequireInt("id")
			if err != nil {
				return mcp.NewToolResultError(err.Error()), nil
			}
			if err := svc.DeleteGroup(int64(id)); err != nil {
				return mcp.NewToolResultError(err.Error()), nil
			}
			return mcp.NewToolResultText(fmt.Sprintf("已删除分组 %d", id)), nil
		},
	)

	// ---------- 入口：增 / 改 / 删 / 移动 ----------
	entryFields := func(idRequired bool) []mcp.ToolOption {
		opts := []mcp.ToolOption{}
		if idRequired {
			opts = append(opts, mcp.WithInteger("id", mcp.Required(), mcp.Description("入口 id")))
		}
		return append(opts,
			mcp.WithInteger("groupId", mcp.Description("所属分组 id")),
			mcp.WithString("name", mcp.Description("入口名称（显示在卡片上）")),
			mcp.WithString("scriptPath", mcp.Description("脚本/程序的路径或命令，例如 D:\\scripts\\deploy.ps1、python、docker")),
			mcp.WithString("arguments", mcp.Description("启动参数，例如 --port 3000")),
			mcp.WithString("workingDirectory", mcp.Description("工作目录，留空则用脚本所在目录")),
			mcp.WithString("icon", mcp.Description("图标（Lucide 名称或 Emoji），可选")),
			mcp.WithBoolean("showTerminal", mcp.Description("是否在系统终端中运行并保留输出，默认 false（在应用内捕获输出）")),
		)
	}

	s.AddTool(
		mcp.NewTool("create_entry",
			mcp.WithDescription("新增一个脚本入口。groupId、name、scriptPath 必填，其余可选。"),
			mcp.WithInteger("groupId", mcp.Required(), mcp.Description("所属分组 id")),
			mcp.WithString("name", mcp.Required(), mcp.Description("入口名称")),
			mcp.WithString("scriptPath", mcp.Required(), mcp.Description("脚本/程序路径或命令")),
			mcp.WithString("arguments", mcp.Description("启动参数，可选")),
			mcp.WithString("workingDirectory", mcp.Description("工作目录，可选")),
			mcp.WithString("icon", mcp.Description("图标，可选")),
			mcp.WithBoolean("showTerminal", mcp.Description("是否在系统终端运行，默认 false")),
		),
		func(ctx context.Context, req mcp.CallToolRequest) (*mcp.CallToolResult, error) {
			groupID, err := req.RequireInt("groupId")
			if err != nil {
				return mcp.NewToolResultError(err.Error()), nil
			}
			name, err := req.RequireString("name")
			if err != nil {
				return mcp.NewToolResultError(err.Error()), nil
			}
			scriptPath, err := req.RequireString("scriptPath")
			if err != nil {
				return mcp.NewToolResultError(err.Error()), nil
			}
			entry, err := svc.CreateEntry(EntryInput{
				GroupID:          int64(groupID),
				Name:             name,
				ScriptPath:       scriptPath,
				Arguments:        req.GetString("arguments", ""),
				WorkingDirectory: req.GetString("workingDirectory", ""),
				Icon:             req.GetString("icon", ""),
				ShowTerminal:     req.GetBool("showTerminal", false),
			})
			if err != nil {
				return mcp.NewToolResultError(err.Error()), nil
			}
			return mcp.NewToolResultText(jsonText(entry)), nil
		},
	)

	updateEntryOpts := append([]mcp.ToolOption{
		mcp.WithDescription("修改一个脚本入口。只传需要改的字段，未传的保持原值。id 必填。"),
		mcp.WithInteger("id", mcp.Required(), mcp.Description("入口 id")),
	}, entryFields(false)...)
	s.AddTool(
		mcp.NewTool("update_entry", updateEntryOpts...),
		func(ctx context.Context, req mcp.CallToolRequest) (*mcp.CallToolResult, error) {
			id, err := req.RequireInt("id")
			if err != nil {
				return mcp.NewToolResultError(err.Error()), nil
			}
			existing, err := svc.getEntry(int64(id))
			if err != nil {
				return mcp.NewToolResultError(err.Error()), nil
			}
			input := EntryInput{
				GroupID:          int64(req.GetInt("groupId", int(existing.GroupID))),
				Name:             req.GetString("name", existing.Name),
				ScriptPath:       req.GetString("scriptPath", existing.ScriptPath),
				Arguments:        req.GetString("arguments", existing.Arguments),
				WorkingDirectory: req.GetString("workingDirectory", existing.WorkingDirectory),
				Icon:             req.GetString("icon", existing.Icon),
				ShowTerminal:     req.GetBool("showTerminal", existing.ShowTerminal),
			}
			entry, err := svc.UpdateEntry(int64(id), input)
			if err != nil {
				return mcp.NewToolResultError(err.Error()), nil
			}
			return mcp.NewToolResultText(jsonText(entry)), nil
		},
	)

	s.AddTool(
		mcp.NewTool("delete_entry",
			mcp.WithDescription("删除一个脚本入口，不可撤销。"),
			mcp.WithDestructiveHintAnnotation(true),
			mcp.WithInteger("id", mcp.Required(), mcp.Description("入口 id")),
		),
		func(ctx context.Context, req mcp.CallToolRequest) (*mcp.CallToolResult, error) {
			id, err := req.RequireInt("id")
			if err != nil {
				return mcp.NewToolResultError(err.Error()), nil
			}
			if err := svc.DeleteEntry(int64(id)); err != nil {
				return mcp.NewToolResultError(err.Error()), nil
			}
			return mcp.NewToolResultText(fmt.Sprintf("已删除入口 %d", id)), nil
		},
	)

	s.AddTool(
		mcp.NewTool("move_entry",
			mcp.WithDescription("把一个入口移动到另一个分组。"),
			mcp.WithInteger("id", mcp.Required(), mcp.Description("入口 id")),
			mcp.WithInteger("groupId", mcp.Required(), mcp.Description("目标分组 id")),
		),
		func(ctx context.Context, req mcp.CallToolRequest) (*mcp.CallToolResult, error) {
			id, err := req.RequireInt("id")
			if err != nil {
				return mcp.NewToolResultError(err.Error()), nil
			}
			groupID, err := req.RequireInt("groupId")
			if err != nil {
				return mcp.NewToolResultError(err.Error()), nil
			}
			entry, err := svc.MoveEntry(int64(id), int64(groupID))
			if err != nil {
				return mcp.NewToolResultError(err.Error()), nil
			}
			return mcp.NewToolResultText(jsonText(entry)), nil
		},
	)

	// ---------- 执行 / 终止 ----------
	s.AddTool(
		mcp.NewTool("execute_script",
			mcp.WithDescription("运行指定入口的脚本，同步等待结束并返回 status/output/error/exitCode/durationMs。长时间脚本会阻塞直到结束；若入口设置了 showTerminal，则只负责在系统终端拉起、立即返回。"),
			mcp.WithInteger("id", mcp.Required(), mcp.Description("入口 id")),
		),
		func(ctx context.Context, req mcp.CallToolRequest) (*mcp.CallToolResult, error) {
			id, err := req.RequireInt("id")
			if err != nil {
				return mcp.NewToolResultError(err.Error()), nil
			}
			result := svc.ExecuteEntry(int64(id))
			text := jsonText(result)
			if result.Status == "failed" {
				return mcp.NewToolResultError(text), nil
			}
			return mcp.NewToolResultText(text), nil
		},
	)

	s.AddTool(
		mcp.NewTool("stop_script",
			mcp.WithDescription("终止某个入口当前正在运行的进程及其子进程（仅对由本 MCP 进程或应用启动、仍在运行的任务有效）。"),
			mcp.WithInteger("id", mcp.Required(), mcp.Description("入口 id")),
		),
		func(ctx context.Context, req mcp.CallToolRequest) (*mcp.CallToolResult, error) {
			id, err := req.RequireInt("id")
			if err != nil {
				return mcp.NewToolResultError(err.Error()), nil
			}
			if err := svc.StopEntry(int64(id)); err != nil {
				return mcp.NewToolResultError(err.Error()), nil
			}
			return mcp.NewToolResultText(fmt.Sprintf("已请求终止入口 %d", id)), nil
		},
	)
}
