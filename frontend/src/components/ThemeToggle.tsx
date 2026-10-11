import { Check, ChevronUp, Monitor, Moon, Sun } from 'lucide-react'
import { useThemeStore, type ThemePreference } from '../store/theme'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu'

const options: Array<{
  value: ThemePreference
  label: string
  icon: typeof Monitor
}> = [
  { value: 'system', label: '跟随系统', icon: Monitor },
  { value: 'light', label: '浅色模式', icon: Sun },
  { value: 'dark', label: '深色模式', icon: Moon },
]

export function ThemeToggle() {
  const preference = useThemeStore((state) => state.preference)
  const setPreference = useThemeStore((state) => state.setPreference)
  const selected = options.find((option) => option.value === preference) ?? options[0]
  const SelectedIcon = selected.icon

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="flex h-10 w-full items-center gap-2 rounded-lg px-3 text-sm text-neutral-500 transition hover:bg-[#f0f0f0] hover:text-[#171717] dark:text-neutral-400 dark:hover:bg-[#1e1e1e] dark:hover:text-white"
          aria-label={`外观：${selected.label}`}
        >
          <SelectedIcon className="size-4" />
          <span>外观</span>
          <span className="ml-auto text-xs text-neutral-400 dark:text-neutral-500">{selected.label}</span>
          <ChevronUp className="size-3.5 text-neutral-400 dark:text-neutral-600" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="top" align="start" className="w-[218px]">
        {options.map((option) => {
          const Icon = option.icon
          const active = option.value === preference
          return (
            <DropdownMenuItem key={option.value} onSelect={() => setPreference(option.value)}>
              <Icon className="size-4" />
              <span>{option.label}</span>
              {active && <Check className="ml-auto size-4 text-[#5e6ad2] dark:text-[#8b93e8]" />}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
