import type React from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PageHeaderProps {
  title: string
  description?: string
  actions?: React.ReactNode
  action?: React.ReactNode   // alias singular usado en algunos componentes
  badge?: React.ReactNode
  backHref?: string          // link de volver usado en páginas de detalle
}

export function PageHeader({ title, description, actions, action, badge, backHref }: PageHeaderProps) {
  const rightContent = actions ?? action
  return (
    <div className="space-y-2 mb-6">
      {backHref && (
        <Button variant="outline" size="sm" asChild className="mb-2">
          <Link href={backHref}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Link>
        </Button>
      )}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-pba-blue tracking-tight">{title}</h1>
            {badge}
          </div>
          {description && <p className="text-muted-foreground text-sm max-w-2xl leading-relaxed">{description}</p>}
        </div>
        {rightContent && <div className="flex items-center gap-3">{rightContent}</div>}
      </div>
    </div>
  )
}

export default PageHeader
