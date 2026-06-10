'use client'

import { useEffect, useState } from 'react'
import { X } from 'lucide-react'

interface ToastProps {
  message: string
  type?: 'error' | 'success' | 'info'
  onClose: () => void
  duration?: number
}

export function Toast({ message, type = 'error', onClose, duration = 5000 }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(onClose, 300) // espera animação sair
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  const bgColor = {
    error: 'bg-red-500',
    success: 'bg-green-500',
    info: 'bg-blue-500',
  }[type]

  return (
    <div
      className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg text-white font-medium text-sm transition-all duration-300 ${bgColor} ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
      }`}
    >
      <span>{message}</span>
      <button
        onClick={() => {
          setIsVisible(false)
          setTimeout(onClose, 300)
        }}
        className="hover:opacity-80 transition"
      >
        <X size={16} />
      </button>
    </div>
  )
}

// Hook para gerenciar toasts
export function useToast() {
  const [toast, setToast] = useState<{
    message: string
    type: 'error' | 'success' | 'info'
  } | null>(null)

  const showToast = (message: string, type: 'error' | 'success' | 'info' = 'error') => {
    setToast({ message, type })
  }

  const hideToast = () => {
    setToast(null)
  }

  return { toast, showToast, hideToast }
}