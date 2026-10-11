import * as DialogPrimitive from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '../../lib/utils'

export const Dialog = DialogPrimitive.Root
export const DialogTrigger = DialogPrimitive.Trigger

export function DialogContent({
  children,
  className,
  title,
  description,
}: {
  children: ReactNode
  className?: string
  title: string
  description?: string
}) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-[#0a0a0a]/25 backdrop-blur-[1px] data-[state=open]:animate-fade-in dark:bg-black/65" />
      <DialogPrimitive.Content
        className={cn(
          'fixed left-1/2 top-1/2 z-50 max-h-[88vh] w-[calc(100%-32px)] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl border border-[#ebebeb] bg-white p-6 shadow-[0_24px_70px_rgba(0,0,0,.16)] outline-none data-[state=open]:animate-dialog-in dark:border-[#262626] dark:bg-[#141414] dark:text-neutral-100',
          className,
        )}
      >
        <div className="mb-5 pr-10">
          <DialogPrimitive.Title className="text-lg font-semibold tracking-tight text-[#171717] dark:text-neutral-50">
            {title}
          </DialogPrimitive.Title>
          {description && (
            <DialogPrimitive.Description className="mt-1 text-sm leading-6 text-neutral-500 dark:text-neutral-400">
              {description}
            </DialogPrimitive.Description>
          )}
        </div>
        {children}
        <DialogPrimitive.Close className="absolute right-4 top-4 grid size-8 place-items-center rounded-lg text-neutral-400 transition hover:bg-[#f5f5f5] hover:text-[#171717] dark:text-neutral-500 dark:hover:bg-[#1e1e1e] dark:hover:text-neutral-200">
          <X className="size-4" />
          <span className="sr-only">关闭</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  )
}
