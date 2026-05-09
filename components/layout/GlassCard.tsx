import { cn } from '@/lib/utils'

interface GlassCardProps {
  children: React.ReactNode
  className?: string
  accent?: 'amber' | 'violet' | 'none'
}

export function GlassCard({ children, className, accent = 'none' }: GlassCardProps) {
  return (
    <div
      className={cn(
        accent === 'amber' ? 'ritual-card-amber' :
        accent === 'violet' ? 'ritual-card-violet' :
        'ritual-card',
        className
      )}
    >
      {children}
    </div>
  )
}
