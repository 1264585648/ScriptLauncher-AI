import * as DropdownPrimitive from '@radix-ui/react-dropdown-menu'
import type { ComponentProps, ReactNode } from 'react'
import { cn } from '../../lib/utils'

export const DropdownMenu = DropdownPrimitive.Root
export const DropdownMenuTrigger = DropdownPrimitive.Trigger

export function DropdownMenuContent({
  className,
  ...props
}: ComponentProps<typeof DropdownPrimitive.Content>) {
  return (
    <DropdownPrimitive.Portal>
      <DropdownPrimitive.Content
        sideOffset={6}
        align="end"
        className={cn(
          'z-50 min-w-40 rounded-lg border border-[#ebebeb] bg-white p-1.5 text-sm text-[#404040] shadow-[0_12px_40px_rgba(0,0,0,.12)] outline-none data-[state=open]:animate-menu-in dark:border-[#262626] dark:bg-[#161616] dark:text-neutral-200',
          className,
        )}
        {...props}
      />
    </DropdownPrimitive.Portal>
  )
}

export function DropdownMenuItem({
  className,
  danger,
  children,
  ...props
}: ComponentProps<typeof DropdownPrimitive.Item> & { danger?: boolean; children: ReactNode }) {
  return (
    <DropdownPrimitive.Item
      className={cn(
        'flex h-9 cursor-default select-none items-center gap-2 rounded-md px-2.5 outline-none data-[highlighted]:bg-[#f5f5f5] dark:data-[highlighted]:bg-[#232323]',
        danger && 'text-[#dc2626] data-[highlighted]:bg-[#fef2f2] dark:text-red-400 dark:data-[highlighted]:bg-[#2a1616]',
        className,
      )}
      {...props}
    >
      {children}
    </DropdownPrimitive.Item>
  )
}

export function DropdownMenuLabel({ children }: { children: ReactNode }) {
  return <DropdownPrimitive.Label className="px-2.5 py-1.5 text-xs font-medium text-neutral-400 dark:text-neutral-500">{children}</DropdownPrimitive.Label>
}

export function DropdownMenuSeparator() {
  return <DropdownPrimitive.Separator className="my-1 h-px bg-[#f0f0f0] dark:bg-[#262626]" />
}
