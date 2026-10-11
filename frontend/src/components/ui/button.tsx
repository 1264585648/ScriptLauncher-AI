import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-colors outline-none disabled:pointer-events-none disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-[#5e6ad2]/45 focus-visible:ring-offset-1 focus-visible:ring-offset-white dark:focus-visible:ring-offset-[#0a0a0a]',
  {
    variants: {
      variant: {
        // Vercel 招牌：近黑主按钮；暗色模式反白
        default:
          'bg-[#171717] text-white hover:bg-[#2f2f2f] dark:bg-[#fafafa] dark:text-[#171717] dark:hover:bg-white',
        // 次要：白底 + 发丝边框
        secondary:
          'border border-[#e5e5e5] bg-white text-[#404040] hover:bg-[#fafafa] hover:text-[#171717] dark:border-[#2e2e2e] dark:bg-[#161616] dark:text-neutral-200 dark:hover:bg-[#1f1f1f] dark:hover:text-white',
        ghost:
          'text-[#525252] hover:bg-[#f5f5f5] hover:text-[#171717] dark:text-neutral-400 dark:hover:bg-[#1e1e1e] dark:hover:text-neutral-100',
        danger:
          'border border-[#f0d5d5] bg-white text-[#dc2626] hover:bg-[#fef2f2] dark:border-[#402020] dark:bg-transparent dark:text-red-400 dark:hover:bg-[#2a1616]',
      },
      size: {
        default: 'h-9 px-3.5',
        sm: 'h-8 rounded-md px-3 text-xs',
        icon: 'size-9 p-0',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
  ),
)
Button.displayName = 'Button'
