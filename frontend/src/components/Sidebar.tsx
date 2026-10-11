import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, LayoutGrid, MoreHorizontal, Pencil, Plus, Trash2 } from 'lucide-react'
import type { Group } from '../../bindings/scriptlauncher/models'
import { EntryIcon } from '../icons'
import { cn } from '../lib/utils'
import { useLauncherStore } from '../store/launcher'
import { Button } from './ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu'
import { ThemeToggle } from './ThemeToggle'

function SortableGroup({
  group,
  active,
  count,
  onSelect,
  onEdit,
  onDelete,
}: {
  group: Group
  active: boolean
  count: number
  onSelect: () => void
  onEdit: () => void
  onDelete: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: group.id })
  return (
    <div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }} className={cn('group/nav flex items-center rounded-lg', isDragging && 'z-10 opacity-60')}>
      <button
        className={cn(
          'flex h-9 min-w-0 flex-1 items-center gap-2 rounded-lg px-2 text-left text-sm transition-colors',
          active
            ? 'bg-[#ececec] font-medium text-[#171717] dark:bg-[#1f1f1f] dark:text-white'
            : 'text-neutral-600 hover:bg-[#f2f2f2] hover:text-[#171717] dark:text-neutral-400 dark:hover:bg-[#1a1a1a] dark:hover:text-neutral-100',
        )}
        onClick={onSelect}
      >
        <span {...attributes} {...listeners} className="cursor-grab touch-none text-neutral-300 opacity-0 transition group-hover/nav:opacity-100 dark:text-neutral-600">
          <GripVertical className="size-3.5" />
        </span>
        <EntryIcon name={group.icon || 'Folder'} className={cn('size-4 shrink-0 rounded-sm', active ? 'text-[#5e6ad2] dark:text-[#8b93e8]' : 'text-neutral-400 dark:text-neutral-500')} />
        <span className="truncate">{group.name}</span>
        <span className="ml-auto text-[11px] tabular-nums text-neutral-400 dark:text-neutral-500">{count}</span>
      </button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="mr-1 grid size-7 place-items-center rounded-md text-neutral-400 opacity-0 transition hover:bg-[#e6e6e6] hover:text-[#171717] group-hover/nav:opacity-100 dark:hover:bg-[#2a2a2a] dark:hover:text-white">
            <MoreHorizontal className="size-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onSelect={onEdit}><Pencil className="size-4" />编辑分组</DropdownMenuItem>
          <DropdownMenuItem danger onSelect={onDelete}><Trash2 className="size-4" />删除分组</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

export function Sidebar({
  selectedGroupID,
  onSelect,
  onAddGroup,
  onEditGroup,
  onDeleteGroup,
}: {
  selectedGroupID: number | null
  onSelect: (id: number | null) => void
  onAddGroup: () => void
  onEditGroup: (group: Group) => void
  onDeleteGroup: (group: Group) => void
}) {
  const groups = useLauncherStore((state) => state.groups)
  const entries = useLauncherStore((state) => state.entries)
  const reorderGroups = useLauncherStore((state) => state.reorderGroups)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return
    const oldIndex = groups.findIndex((group) => group.id === active.id)
    const newIndex = groups.findIndex((group) => group.id === over.id)
    reorderGroups(arrayMove(groups, oldIndex, newIndex).map((group) => group.id))
  }

  return (
    <aside className="flex w-[244px] shrink-0 flex-col border-r border-[#ebebeb] bg-[#fafafa] px-3 pb-4 pt-[54px] text-[#171717] transition-colors dark:border-[#1f1f1f] dark:bg-[#0f0f0f] dark:text-white">
      <div className="mb-7 flex min-w-0 items-center gap-2.5 px-3">
        <img src="/script-launcher-logo.png" alt="" className="size-9 shrink-0" />
        <div className="min-w-0 leading-tight">
          <p className="truncate whitespace-nowrap text-[14px] font-semibold tracking-tight">Script Launcher</p>
          <p className="mt-1 truncate whitespace-nowrap text-[11px] text-neutral-400 dark:text-neutral-500">本地脚本工作台</p>
        </div>
      </div>

      <nav className="space-y-0.5">
        <button
          className={cn(
            'flex h-9 w-full items-center gap-3 rounded-lg px-3 text-sm transition-colors',
            selectedGroupID === null
              ? 'bg-[#ececec] font-medium text-[#171717] dark:bg-[#1f1f1f] dark:text-white'
              : 'text-neutral-600 hover:bg-[#f2f2f2] hover:text-[#171717] dark:text-neutral-400 dark:hover:bg-[#1a1a1a] dark:hover:text-neutral-100',
          )}
          onClick={() => onSelect(null)}
        >
          <LayoutGrid className={cn('size-4', selectedGroupID === null ? 'text-[#5e6ad2] dark:text-[#8b93e8]' : 'text-neutral-400 dark:text-neutral-500')} />
          <span>全部入口</span>
          <span className="ml-auto text-[11px] tabular-nums text-neutral-400 dark:text-neutral-500">{entries.length}</span>
        </button>
      </nav>

      <div className="mb-2 mt-7 flex items-center justify-between px-3">
        <span className="text-[10px] font-semibold uppercase tracking-[.16em] text-neutral-400 dark:text-neutral-600">分组</span>
        <button className="grid size-6 place-items-center rounded-md text-neutral-400 transition hover:bg-[#ececec] hover:text-[#171717] dark:hover:bg-[#232323] dark:hover:text-white" onClick={onAddGroup} title="新增分组">
          <Plus className="size-3.5" />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={groups.map((group) => group.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-0.5">
              {groups.map((group) => (
                <SortableGroup
                  key={group.id}
                  group={group}
                  active={selectedGroupID === group.id}
                  count={entries.filter((entry) => entry.groupId === group.id).length}
                  onSelect={() => onSelect(group.id)}
                  onEdit={() => onEditGroup(group)}
                  onDelete={() => onDeleteGroup(group)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>

      <div className="mt-4 border-t border-[#ebebeb] pt-4 dark:border-[#1f1f1f]">
        <ThemeToggle />
        <Button variant="ghost" className="w-full justify-start text-neutral-600 hover:bg-[#f2f2f2] hover:text-[#171717] dark:text-neutral-400 dark:hover:bg-[#1a1a1a] dark:hover:text-white" onClick={onAddGroup}>
          <Plus className="size-4" />新增分组
        </Button>
      </div>
    </aside>
  )
}
