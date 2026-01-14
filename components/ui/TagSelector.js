'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/lib/auth'
import { tagService } from '@/lib/supabase'
import TagPill from './TagPill'

export default function TagSelector({ 
  selectedTags = [], 
  onTagsChange, 
  placeholder = "Add tags...",
  className = '' 
}) {
  const { user } = useAuth()
  const [availableTags, setAvailableTags] = useState([])
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)

  // Load user's tags
  useEffect(() => {
    if (user) {
      loadTags()
    }
  }, [user])

  const loadTags = async () => {
    try {
      setLoading(true)
      const tags = await tagService.getUserTags(user.id)
      setAvailableTags(tags)
    } catch (error) {
      console.error('Error loading tags:', error)
    } finally {
      setLoading(false)
    }
  }

  // Filter tags based on search query
  const filteredTags = availableTags.filter(tag => 
    tag.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
    !selectedTags.some(selectedTag => selectedTag.id === tag.id)
  )

  const handleTagSelect = (tag) => {
    const newSelectedTags = [...selectedTags, tag]
    onTagsChange(newSelectedTags)
    setSearchQuery('')
  }

  const handleTagRemove = (tagToRemove) => {
    const newSelectedTags = selectedTags.filter(tag => tag.id !== tagToRemove.id)
    onTagsChange(newSelectedTags)
  }

  const handleCreateNewTag = () => {
    if (searchQuery.trim()) {
      // This will be handled by the parent component or TagManager
      // For now, we'll just close the dropdown
      setIsOpen(false)
      setSearchQuery('')
    }
  }

  return (
    <div className={`relative ${className}`}>
      {/* Selected Tags */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          <AnimatePresence>
            {selectedTags.map((tag) => (
              <motion.div
                key={tag.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
              >
                <TagPill
                  tag={tag}
                  size="sm"
                  removable
                  onRemove={handleTagRemove}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Input Field */}
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />

        {/* Dropdown */}
        <AnimatePresence>
          {isOpen && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 z-10"
                onClick={() => setIsOpen(false)}
              />

              {/* Dropdown Content */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 max-h-48 overflow-y-auto"
              >
                {loading ? (
                  <div className="p-3 text-center text-gray-500">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600 mx-auto"></div>
                  </div>
                ) : (
                  <>
                    {/* Filtered Tags */}
                    {filteredTags.length > 0 ? (
                      <div className="p-2">
                        {filteredTags.map((tag) => (
                          <button
                            key={tag.id}
                            onClick={() => handleTagSelect(tag)}
                            className="w-full text-left p-2 hover:bg-gray-50 rounded flex items-center gap-2"
                          >
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: tag.color }}
                            />
                            <span className="text-sm">{tag.name}</span>
                          </button>
                        ))}
                      </div>
                    ) : searchQuery.trim() ? (
                      <div className="p-3">
                        <button
                          onClick={handleCreateNewTag}
                          className="w-full text-left p-2 hover:bg-gray-50 rounded text-sm text-purple-600 flex items-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          Create "{searchQuery}"
                        </button>
                      </div>
                    ) : (
                      <div className="p-3 text-center text-gray-500 text-sm">
                        No tags found
                      </div>
                    )}
                  </>
                )}
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
