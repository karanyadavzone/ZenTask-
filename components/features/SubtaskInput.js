'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

export default function SubtaskInput({ onCreate }) {
  const [isOpen, setIsOpen] = useState(false)
  const [title, setTitle] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (title.trim()) {
      onCreate(title.trim())
      setTitle('')
      setIsOpen(false)
    }
  }

  const handleCancel = () => {
    setTitle('')
    setIsOpen(false)
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Add subtask
      </button>
    )
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      onSubmit={handleSubmit}
      className="flex items-center gap-2"
    >
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Add a subtask..."
        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
        autoFocus
      />
      <button
        type="submit"
        disabled={!title.trim()}
        className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
      >
        Add
      </button>
      <button
        type="button"
        onClick={handleCancel}
        className="px-3 py-2 text-gray-600 hover:text-gray-800 text-sm"
      >
        Cancel
      </button>
    </motion.form>
  )
}

