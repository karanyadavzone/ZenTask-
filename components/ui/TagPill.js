'use client'

import { motion } from 'framer-motion'

export default function TagPill({ 
  tag, 
  size = 'sm', 
  removable = false, 
  onRemove = null,
  onClick = null,
  className = ''
}) {
  const sizeClasses = {
    xs: 'px-2 py-0.5 text-xs',
    sm: 'px-2.5 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  }

  const handleClick = (e) => {
    if (onClick) {
      e.stopPropagation()
      onClick(tag)
    }
  }

  const handleRemove = (e) => {
    e.stopPropagation()
    if (onRemove) {
      onRemove(tag)
    }
  }

  return (
    <motion.span
      className={`
        inline-flex items-center gap-1 rounded-full font-medium
        ${sizeClasses[size]}
        ${onClick ? 'cursor-pointer hover:opacity-80' : ''}
        ${className}
      `}
      style={{
        backgroundColor: tag.color + '20', // 20% opacity
        color: tag.color,
        border: `1px solid ${tag.color}40` // 40% opacity border
      }}
      onClick={handleClick}
      whileHover={onClick ? { scale: 1.05 } : {}}
      whileTap={onClick ? { scale: 0.95 } : {}}
    >
      <span>{tag.name}</span>
      
      {removable && onRemove && (
        <button
          onClick={handleRemove}
          className="ml-1 hover:bg-black/10 rounded-full p-0.5 transition-colors"
          type="button"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </motion.span>
  )
}
