import { cn } from '@/lib/utils'

interface GlassCardProps {
  children: React.ReactNode
  className?: string
  accent?: 'orange' | 'cyan' | 'none'
}

export function GlassCard({ children, className, accent = 'cyan' }: GlassCardProps) {
  return (
    <div
      className={cn(
        accent === 'orange' ? 'glass-card-orange' : 'glass-card',
        className
      )}
    >
      {children}
    </div>
  )
}
