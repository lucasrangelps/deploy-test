'use client'

import { useState, useEffect, useRef } from 'react'
import { Search } from 'lucide-react'

interface SearchBarProps {
  placeholder?: string
  onSearch: (term: string) => void
  debounceMs?: number
}

export default function SearchBar({
  placeholder = 'Buscar...',
  onSearch,
  debounceMs = 300,
}: SearchBarProps) {
  const [value, setValue] = useState('')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      onSearch(value.trim())
    }, debounceMs)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [value, debounceMs, onSearch])

  return (
    <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', width: '100%', maxWidth: 340 }}>
      <Search
        size={16}
        style={{
          position: 'absolute',
          left: 12,
          color: '#6B6B6B',
          pointerEvents: 'none',
        }}
      />
      <input
        type="text"
        className="form-input"
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        style={{ paddingLeft: 38, width: '100%' }}
      />
    </div>
  )
}

export type { SearchBarProps }
