import { Upload } from 'lucide-react'
import { cn } from '../lib/utils'

export function DropZoneOverlay({ visible }: { visible: boolean }) {
  return (
    <div
      className={cn(
        'drop-overlay pointer-events-none fixed inset-0 z-[100] grid place-items-center bg-[#5e6ad2]/10 backdrop-blur-sm transition-opacity duration-200',
        visible ? 'opacity-100' : 'opacity-0'
      )}
    >
      <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#5e6ad2] bg-white/80 p-12 text-center shadow-2xl dark:bg-[#0a0a0a]/80">
        <Upload className="mb-4 size-12 text-[#5e6ad2]" />
        <h2 className="text-xl font-semibold text-[#171717] dark:text-neutral-50">
          释放文件以添加脚本
        </h2>
        <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
          支持 .py .ps1 .js .sh .bat .exe 等脚本文件
        </p>
      </div>
    </div>
  )
}
