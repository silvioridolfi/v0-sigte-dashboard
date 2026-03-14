import type React from "react"

interface PageHeaderProps {
  title: string
  description?: string
  actions?: React.ReactNode
  badge?: React.ReactNode
}

export function PageHeader({ title, description, actions, badge }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold text-pba-blue tracking-tight">{title}</h1>
          {badge}
        </div>
        {description && <p className="text-muted-foreground text-sm max-w-2xl leading-relaxed">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </div>
  )
}
