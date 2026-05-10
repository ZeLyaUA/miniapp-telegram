import { cn } from '@/lib/utils'

interface ViewShellProps {
  header: React.ReactNode
  children: React.ReactNode
  contentClassName?: string
}

export function ViewShell({ header, children, contentClassName }: ViewShellProps) {
  return (
    <div className="flex flex-col h-full">
      {header}
      <div className={cn('flex-1 overflow-y-auto scrollbar-hide min-h-0', contentClassName)}>
        {children}
      </div>
    </div>
  )
}
