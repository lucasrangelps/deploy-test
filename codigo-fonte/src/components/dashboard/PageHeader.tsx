'use client'

import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'

interface PageHeaderAction {
  label: string
  href?: string
  onClick?: () => void
  icon?: LucideIcon
}

interface PageHeaderProps {
  label: string
  title: string
  subtitle?: string
  action?: PageHeaderAction
}

export default function PageHeader({ label, title, subtitle, action }: PageHeaderProps) {
  const ActionIcon = action?.icon

  const actionButton = action ? (
    action.href ? (
      <Link href={action.href} className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}>
        {ActionIcon && <ActionIcon size={16} />}
        {action.label}
      </Link>
    ) : (
      <button className="btn-primary" onClick={action.onClick} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
        {ActionIcon && <ActionIcon size={16} />}
        {action.label}
      </button>
    )
  ) : null

  return (
    <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div>
        <p className="page-label">{label}</p>
        <h1 className="page-title">{title}</h1>
        {subtitle && <p className="page-subtitle">{subtitle}</p>}
      </div>
      {actionButton && <div style={{ flexShrink: 0 }}>{actionButton}</div>}
    </div>
  )
}

export type { PageHeaderProps, PageHeaderAction }
