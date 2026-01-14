'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/lib/auth'
import { tagService } from '@/lib/supabase'
import TagPill from './TagPill'

export default function QuickFilter({ 
  activeFilters = [], 
  onFiltersChange,
  className = '' 
}) {
  const { user } = useAuth()
  const [userTags, setUserTags] = useState([])
  const [showTagFilter, setShowTagFilter] = useState(false)

  // Predefined filters
  const predefinedFilters = [
    { id: 'all', label: 'All', type: 'status' },
    { id: 'high_priority', label: 'High Priority', type: 'priority' },
    { id: 'in_progress', label: 'In Progress', type: 'status' },
    { id: 'completed', label: 'Completed', type: 'status' },
  ]

  useEffect(() => {
    if (user) {
      loadUserTags()
    }
  }, [user])

  const loadUserTags = async () => {
    try {
      const tags = await tagService.getUserTags(user.id)
      setUserTags(tags)
    } catch (error) {
      console.error('Error loading tags:', error)
    }
  }

  const handleFilterToggle = (filter) => {
    const isActive = activeFilters.some(f => f.id === filter.id)
    
    if (filter.id === 'all') {
      // "All" button - clear all filters
      onFiltersChange([])
      return
    }
    
    if (isActive) {
      // Remove filter
      const newFilters = activeFilters.filter(f => f.id !== filter.id)
      onFiltersChange(newFilters)
    } else {
      // Add filter (replace if same type for predefined filters)
      let newFilters = [...activeFilters]
      
      if (filter.type === 'status') {
        // Remove other status filters
        newFilters = newFilters.filter(f => f.type !== 'status')
      }
      
      newFilters.push(filter)
      onFiltersChange(newFilters)
    }
  }

  const handleTagFilter = (tag) => {
    const tagFilter = { id: tag.id, label: tag.name, type: 'tag', tag }
    handleFilterToggle(tagFilter)
    setShowTagFilter(false)
  }

  const isFilterActive = (filter) => {
    if (filter.id === 'all') {
      return activeFilters.length === 0
    }
    return activeFilters.some(f => f.id === filter.id)
  }

  const getActiveTagFilters = () => {
    return activeFilters.filter(f => f.type === 'tag')
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Main Filter Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {/* Predefined Filters */}
        {predefinedFilters.map((filter) => (
          <motion.button
            key={filter.id}
            onClick={() => handleFilterToggle(filter)}
            className={`
              flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-all
              ${isFilterActive(filter)
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }
            `}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {filter.label}
          </motion.button>
        ))}

        {/* Tag Filter Button */}
        <div className="relative">
          <motion.button
            onClick={() => setShowTagFilter(!showTagFilter)}
            className={`
              flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-1
              ${getActiveTagFilters().length > 0
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }
            `}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            Tags
            {getActiveTagFilters().length > 0 && (
              <span className="ml-1 bg-white/20 text-xs px-1.5 py-0.5 rounded-full">
                {getActiveTagFilters().length}
              </span>
            )}
          </motion.button>

          {/* Tag Filter Dropdown */}
          <AnimatePresence>
            {showTagFilter && (
              <>
                {/* Backdrop */}
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowTagFilter(false)}
                />

                {/* Dropdown */}
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 min-w-48 max-h-48 overflow-y-auto"
                >
                  {userTags.length > 0 ? (
                    <div className="p-2">
                      {userTags.map((tag) => (
                        <button
                          key={tag.id}
                          onClick={() => handleTagFilter(tag)}
                          className={`
                            w-full text-left p-2 rounded hover:bg-gray-50 transition-colors flex items-center gap-2
                            ${getActiveTagFilters().some(f => f.id === tag.id) ? 'bg-purple-50' : ''}
                          `}
                        >
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: tag.color }}
                          />
                          <span className="text-sm">{tag.name}</span>
                          {getActiveTagFilters().some(f => f.id === tag.id) && (
                            <svg className="w-4 h-4 text-purple-600 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="p-3 text-center text-gray-500 text-sm">
                      No tags available
                    </div>
                  )}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Clear Filters */}
        {activeFilters.length > 0 && (
          <motion.button
            onClick={() => onFiltersChange([])}
            className="flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Clear
          </motion.button>
        )}
      </div>

      {/* Active Tag Filters */}
      {getActiveTagFilters().length > 0 && (
        <div className="flex flex-wrap gap-2">
          <AnimatePresence>
            {getActiveTagFilters().map((filter) => (
              <motion.div
                key={filter.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
              >
                <TagPill
                  tag={filter.tag}
                  size="sm"
                  removable
                  onRemove={() => handleFilterToggle(filter)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
