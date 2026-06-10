'use client'

import { useEffect } from 'react'
import { AlertTriangle } from 'lucide-react'

interface ConfirmModalProps {
  open: boolean
  title: string
  description: string
  confirmLabel?: string
  onConfirm: () => void
  onCancel: () => void
  variant?: 'default' | 'danger'
}

export default function ConfirmModal({
  open,
  title,
  description,
  confirmLabel = 'Confirmar',
  onConfirm,
  onCancel,
  variant = 'default',
}: ConfirmModalProps) {
  // Fechar com Escape
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onCancel])

  if (!open) return null

  const confirmStyle: React.CSSProperties =
    variant === 'danger'
      ? { background: '#EF4444', color: '#FFFFFF', border: 'none', borderRadius: 8, padding: '9px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }
      : undefined as unknown as React.CSSProperties

  return (
    <div
      className="modal-overlay"
      onClick={(e) => { if (e.target === e.currentTarget) onCancel() }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
    >
      <div className="modal-box">
        {variant === 'danger' && (
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertTriangle size={24} color="#EF4444" />
            </div>
          </div>
        )}

        <h2 id="confirm-modal-title" className="modal-title">{title}</h2>
        <p className="modal-description">{description}</p>

        <div className="form-actions" style={{ justifyContent: 'flex-end' }}>
          <button className="btn-secondary" onClick={onCancel}>
            Cancelar
          </button>
          {variant === 'danger' ? (
            <button style={confirmStyle} onClick={onConfirm}>
              {confirmLabel}
            </button>
          ) : (
            <button className="btn-primary" onClick={onConfirm}>
              {confirmLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export type { ConfirmModalProps }
