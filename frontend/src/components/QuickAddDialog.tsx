import { useEffect, useState } from 'react'
import { useLauncherStore } from '../store/launcher'
import { Button } from './ui/button'
import { Dialog, DialogContent } from './ui/dialog'

export function QuickAddDialog({
  open,
  onOpenChange,
  filePaths,
  onConfirm,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  filePaths: string[]
  onConfirm: (groupId: number) => void
}) {
  const groups = useLauncherStore((state) => state.groups)
  const [groupId, setGroupId] = useState<number>(0)

  useEffect(() => {
    if (open) {
      if (groups.length > 0) {
        setGroupId(groups[0].id)
      } else {
        setGroupId(0)
      }
    }
  }, [open, groups])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        title="添加脚本到分组"
        description={`${filePaths.length} 个文件待添加`}
      >
        <div className="space-y-5 mt-2">
          <div>
            <label className="field-label" htmlFor="quick-add-group">所属分组</label>
            <select
              id="quick-add-group"
              className="field-input"
              value={groupId}
              onChange={(e) => setGroupId(Number(e.target.value))}
            >
              <option value={0}>新建分组「快速添加」</option>
              {groups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              取消
            </Button>
            <Button type="button" onClick={() => onConfirm(groupId)}>
              确认添加
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
