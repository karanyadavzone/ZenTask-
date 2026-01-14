'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function SearchBar({ 
  onSearch, 
  placeholder = "Search tasks...",
  className = '',
  showResults = false,
  results = [],
  onResultClick = null,
  loading = false
}) {
  const [query, setQuery] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const inputRef = useRef(null)
  const debounceRef = useRef(null)

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    debounceRef.current = setTimeout(() => {
      if (onSearch) {
        onSearch(query)
      }
    }, 300)

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [query, onSearch])

  const handleClear = () => {
    setQuery('')
    if (onSearch) {
      onSearch('')
    }
    inputRef.current?.focus()
  }

  const handleResultClick = (result) => {
    if (onResultClick) {
      onResultClick(result)
    }
    setIsFocused(false)
    inputRef.current?.blur()
  }

  return (
    <div className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 150)}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
        />

        {/* Loading or Clear Button */}
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
          {loading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
          ) : query ? (
            <button
              onClick={handleClear}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          ) : null}
        </div>
      </div>

      {/* Search Results Dropdown */}
      <AnimatePresence>
        {showResults && isFocused && query && (
          <>
            {/* Backdrop */}
            <div className="fixed inset-0 z-10" />

            {/* Results */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 max-h-64 overflow-y-auto"
            >
              {results.length > 0 ? (
                <div className="p-2">
                  {results.map((result, index) => (
                    <button
                      key={result.id || index}
                      onClick={() => handleResultClick(result)}
                      className="w-full text-left p-3 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        {/* Task Status Icon */}
                        <div className={`
                          w-2 h-2 rounded-full mt-2 flex-shrink-0
                          ${result.status === 'completed' ? 'bg-green-500' : 
                            result.status === 'in_progress' ? 'bg-blue-500' : 
                            'bg-gray-400'}
                        `} />
                        
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            {result.title}
                          </h4>
                          {result.description && (
                            <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                              {result.description}
                            </p>
                          )}
                          
                          {/* Tags */}
                          {result.task_tags && result.task_tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {result.task_tags.slice(0, 3).map((taskTag) => (
                                <span
                                  key={taskTag.tags.id}
                                  className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                                  style={{
                                    backgroundColor: taskTag.tags.color + '20',
                                    color: taskTag.tags.color
                                  }}
                                >
                                  {taskTag.tags.name}
                                </span>
                              ))}
                              {result.task_tags.length > 3 && (
                                <span className="text-xs text-gray-400">
                                  +{result.task_tags.length - 3} more
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Priority Indicator */}
                        <div className={`
                          w-1 h-8 rounded-full flex-shrink-0
                          ${result.priority === 'high' ? 'bg-red-500' : 
                            result.priority === 'medium' ? 'bg-yellow-500' : 
                            'bg-green-500'}
                        `} />
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-gray-500 text-sm">
                  No tasks found for "{query}"
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
