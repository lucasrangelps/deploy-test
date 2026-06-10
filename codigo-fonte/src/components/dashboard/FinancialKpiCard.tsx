'use client'

import type { LucideIcon } from 'lucide-react'
import { TrendingUp, TrendingDown } from 'lucide-react'

type KpiVariant = 'primary' | 'gold' | 'danger' | 'neutral'

interface KpiTrend {
  direction: 'up' | 'down'
  label: string
}

interface FinancialKpiCardProps {
  label: string
  value: string
  icon: LucideIcon
  variant: KpiVariant
  trend?: KpiTrend
}

const VARIANT_MAP: Record<KpiVariant, { color: string; background: string }> = {
  primary: { color: '#8B1A2F',                   background: 'rgba(139, 26, 47, 0.08)'  },
  gold:    { color: '#C9A96E',                   background: 'rgba(201, 169, 110, 0.1)' },
  danger:  { color: '#EF4444',                   background: 'rgba(239, 68, 68, 0.08)'  },
  neutral: { color: '#6B6B6B',                   background: '#F0EDE8'                  },
}

export default function FinancialKpiCard({ label, value, icon: Icon, variant, trend }: FinancialKpiCardProps) {
  const { color, background } = VARIANT_MAP[variant]

  const trendColor = trend?.direction === 'up' ? '#1A7340' : '#991B1B'
  const TrendIcon  = trend?.direction === 'up' ? TrendingUp : TrendingDown

  return (
    <div className="kpi-card">
      <div className="kpi-icon" style={{ background, color }}>
        <Icon size={20} />
      </div>
      <div>
        <p className="kpi-value">{value}</p>
        <p style={{ fontSize: 11, color: '#6B6B6B', fontWeight: 500, marginTop: 2 }}>{label}</p>
        {trend && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 6 }}>
            <TrendIcon size={12} color={trendColor} />
            <span style={{ fontSize: 11, color: trendColor, fontWeight: 600 }}>{trend.label}</span>
          </div>
        )}
      </div>
    </div>
  )
}

export type { FinancialKpiCardProps, KpiVariant, KpiTrend }
