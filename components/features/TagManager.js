'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/lib/auth'
import { tagService } from '@/lib/supabase'
import TagPill from '@/components/ui/TagPill'
import ColorPicker from '@/components/ui/ColorPicker'
import ConfirmModal from '@/components/ui/ConfirmModal'

export default function TagManager({ onClose, onTagCreated }) {
  const { user } = useAuth()
  const [tags, setTags] = useState([])
  const [loading, setLoading] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingTag, setEditingTag] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    color: '#3B82F6'
  })
  const [deleteTagId, setDeleteTagId] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  useEffect(() => {
    if (user) {
      loadTags()
    }
  }, [user])

  const loadTags = async () => {
    try {
      setLoading(true)
      const userTags = await tagService.getUserTags(user.id)
      setTags(userTags)
    } catch (error) {
      console.error('Error loading tags:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTag = async (e) => {
    e.preventDefault()
    if (!formData.name.trim()) return

    try {
      setLoading(true)
      const newTag = await tagService.createTag(user.id, {
        name: formData.name.trim(),
        color: formData.color
      })
      
      setTags(prev => [...prev, newTag])
      setFormData({ name: '', color: '#3B82F6' })
      setShowCreateForm(false)
      
      if (onTagCreated) {
        onTagCreated(newTag)
      }
    } catch (error) {
      console.error('Error creating tag:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateTag = async (e) => {
    e.preventDefault()
    if (!formData.name.trim() || !editingTag) return

    try {
      setLoading(true)
      const updatedTag = await tagService.updateTag(editingTag.id, {
        name: formData.name.trim(),
        color: formData.color
      })
      
      setTags(prev => prev.map(tag => 
        tag.id === editingTag.id ? updatedTag : tag
      ))
      
      setEditingTag(null)
      setFormData({ name: '', color: '#3B82F6' })
    } catch (error) {
      console.error('Error updating tag:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteTag = async () => {
    if (!deleteTagId) return

    try {
      setLoading(true)
      await tagService.deleteTag(deleteTagId)
      setTags(prev => prev.filter(tag => tag.id !== deleteTagId))
      setDeleteTagId(null)
      setShowDeleteModal(false)
    } catch (error) {
      console.error('Error deleting tag:', error)
    } finally {
      setLoading(false)
    }
  }

  const openDeleteModal = (tagId) => {
    setDeleteTagId(tagId)
    setShowDeleteModal(true)
  }

  const startEditing = (tag) => {
    setEditingTag(tag)
    setFormData({
      name: tag.name,
      color: tag.color
    })
    setShowCreateForm(true)
  }

  const cancelEditing = () => {
    setEditingTag(null)
    setFormData({ name: '', color: '#3B82F6' })
    setShowCreateForm(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Manage Tags</h2>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="btn-primary text-sm"
        >
          {showCreateForm ? 'Cancel' : 'New Tag'}
        </button>
      </div>

      {/* Create/Edit Form */}
      <AnimatePresence>
        {showCreateForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <form 
              onSubmit={editingTag ? handleUpdateTag : handleCreateTag}
              className="bg-gray-50 p-4 rounded-lg space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tag Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter tag name..."
                  className="input"
                  required
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Color
                </label>
                <ColorPicker
                  selectedColor={formData.color}
                  onColorSelect={(color) => setFormData(prev => ({ ...prev, color }))}
                  showCustomInput={true}
                />
              </div>

              {/* Preview */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preview
                </label>
                <TagPill
                  tag={{ name: formData.name || 'Tag Name', color: formData.color }}
                  size="md"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={loading || !formData.name.trim()}
                  className="btn-primary flex-1"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {editingTag ? 'Updating...' : 'Creating...'}
                    </div>
                  ) : (
                    editingTag ? 'Update Tag' : 'Create Tag'
                  )}
                </button>
                <button
                  type="button"
                  onClick={cancelEditing}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Existing Tags */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-3">
          Your Tags ({tags.length})
        </h3>
        
        {loading && tags.length === 0 ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
            <p className="text-gray-500 mt-2">Loading tags...</p>
          </div>
        ) : tags.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            <p>No tags yet</p>
            <p className="text-sm">Create your first tag to get started</p>
          </div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence>
              {tags.map((tag) => (
                <motion.div
                  key={tag.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg"
                >
                  <TagPill tag={tag} size="md" />
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => startEditing(tag)}
                      className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                      title="Edit tag"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => openDeleteModal(tag.id)}
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                      title="Delete tag"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false)
          setDeleteTagId(null)
        }}
        onConfirm={handleDeleteTag}
        title="Delete Tag"
        message="Are you sure you want to delete this tag? It will be removed from all tasks."
        confirmText="Delete"
        cancelText="Cancel"
        confirmColor="bg-red-600 hover:bg-red-700"
        isLoading={loading}
      />
    </div>
  )
}
