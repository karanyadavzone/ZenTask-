'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

const predefinedColors = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Orange
  '#8B5CF6', // Purple
  '#EF4444', // Red
  '#06B6D4', // Cyan
  '#84CC16', // Lime
  '#EC4899', // Pink
  '#6B7280', // Gray
  '#F97316', // Orange-red
  '#14B8A6', // Teal
  '#A855F7', // Violet
]

export default function ColorPicker({ 
  selectedColor, 
  onColorSelect, 
  showCustomInput = false,
  className = '' 
}) {
  const [showCustom, setShowCustom] = useState(false)
  const [customColor, setCustomColor] = useState(selectedColor || '#3B82F6')

  const handleColorSelect = (color) => {
    onColorSelect(color)
  }

  const handleCustomColorChange = (e) => {
    const color = e.target.value
    setCustomColor(color)
    onColorSelect(color)
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Predefined Colors Grid */}
      <div className="grid grid-cols-6 gap-2">
        {predefinedColors.map((color) => (
          <motion.button
            key={color}
            type="button"
            className={`
              w-8 h-8 rounded-full border-2 transition-all
              ${selectedColor === color 
                ? 'border-gray-400 scale-110' 
                : 'border-gray-200 hover:border-gray-300'
              }
            `}
            style={{ backgroundColor: color }}
            onClick={() => handleColorSelect(color)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            {selectedColor === color && (
              <svg className="w-4 h-4 text-white mx-auto" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
          </motion.button>
        ))}
      </div>

      {/* Custom Color Input */}
      {showCustomInput && (
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => setShowCustom(!showCustom)}
            className="text-sm text-gray-600 hover:text-gray-800 flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
            </svg>
            Custom Color
          </button>
          
          {showCustom && (
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={customColor}
                onChange={handleCustomColorChange}
                className="w-10 h-8 rounded border border-gray-300 cursor-pointer"
              />
              <input
                type="text"
                value={customColor}
                onChange={(e) => {
                  setCustomColor(e.target.value)
                  if (e.target.value.match(/^#[0-9A-F]{6}$/i)) {
                    onColorSelect(e.target.value)
                  }
                }}
                placeholder="#3B82F6"
                className="flex-1 px-3 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
