'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

export default function SubtaskItem({ subtask, onToggle, onUpdate, onDelete }) {
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(subtask.title)

  const handleSave = () => {
    if (editTitle.trim()) {
      onUpdate(editTitle.trim())
      setIsEditing(false)
    }
  }

  const handleCancel = () => {
    setEditTitle(subtask.title)
    setIsEditing(false)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSave()
    } else if (e.key === 'Escape') {
      handleCancel()
    }
  }

  return (
    <motion.div
      className={`
        flex items-center gap-3 p-2 rounded-lg transition-colors
        ${subtask.completed ? 'bg-gray-50' : 'bg-white hover:bg-gray-50'}
      `}
      whileHover={{ scale: 1.01 }}
    >
      {/* Checkbox */}
      <button
        onClick={() => onToggle(!subtask.completed)}
        className={`
          flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-all
          ${subtask.completed
            ? 'bg-purple-600 border-purple-600'
            : 'border-gray-300 hover:border-purple-400'
          }
        `}
      >
        {subtask.completed && (
          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>

      {/* Title */}
      {isEditing ? (
        <input
          type="text"
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          className="flex-1 px-2 py-1 border border-purple-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
          autoFocus
        />
      ) : (
        <button
          onClick={() => setIsEditing(true)}
          className={`
            flex-1 text-left text-sm
            ${subtask.completed
              ? 'line-through text-gray-500'
              : 'text-gray-900'
            }
          `}
        >
          {subtask.title}
        </button>
      )}

      {/* Delete Button */}
      {!isEditing && (
        <button
          onClick={onDelete}
          className="flex-shrink-0 p-1 text-gray-400 hover:text-red-600 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      )}
    </motion.div>
  )
}


