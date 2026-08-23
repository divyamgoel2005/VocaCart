import { cn } from '@/lib/utils'

interface PanelProps {
  title: string
  subtitle?: string
  icon?: React.ReactNode
  action?: React.ReactNode
  className?: string
  contentClassName?: string
  children: React.ReactNode
}

// Restrained surface used for side regions — a soft panel with a labelled
// header, deliberately not a glassy "dashboard card".
export function Panel({
  title,
  subtitle,
  icon,
  action,
  className,
  contentClassName,
  children,
}: PanelProps) {
  return (
    <section
      className={cn(
        'flex flex-col rounded-2xl border border-border/70 bg-surface/60',
        className,
      )}
    >
      <header className="flex items-center gap-3 px-5 pt-5">
        {icon && (
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-voice/12 text-voice">
            {icon}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-lg font-semibold leading-tight tracking-tight">
            {title}
          </h2>
          {subtitle && <p className="truncate text-xs text-muted-foreground">{subtitle}</p>}
        </div>
        {action}
      </header>
      <div className={cn('flex-1 px-5 pb-5 pt-3', contentClassName)}>{children}</div>
    </section>
  )
}
