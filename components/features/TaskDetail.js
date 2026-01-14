'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/lib/auth'
import { taskService, tagService } from '@/lib/supabase'
import { format, parseISO } from 'date-fns'
import TagPill from '@/components/ui/TagPill'
import TagSelector from '@/components/ui/TagSelector'
import SubtaskList from './SubtaskList'
import ConfirmModal from '@/components/ui/ConfirmModal'

export default function TaskDetail({ task, onUpdate, onClose }) {
  const { user } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [currentTask, setCurrentTask] = useState(task)
  const [availableTags, setAvailableTags] = useState([])
  const [showTagSelector, setShowTagSelector] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  
  const [formData, setFormData] = useState({
    title: task.title || '',
    description: task.description || '',
    status: task.status || 'todo',
    priority: task.priority || 'medium',
    due_date: task.due_date ? task.due_date.split('T')[0] : '',
    due_time: task.due_time || ''
  })

  // Get current task tags
  const currentTags = currentTask.task_tags?.map(tt => tt.tags) || 
                     currentTask.tags || []

  useEffect(() => {
    setCurrentTask(task)
    setFormData({
      title: task.title || '',
      description: task.description || '',
      status: task.status || 'todo',
      priority: task.priority || 'medium',
      due_date: task.due_date ? task.due_date.split('T')[0] : '',
      due_time: task.due_time || ''
    })
  }, [task])

  useEffect(() => {
    if (user && showTagSelector) {
      loadTags()
    }
  }, [user, showTagSelector])

  const loadTags = async () => {
    try {
      const tags = await tagService.getUserTags(user.id)
      setAvailableTags(tags)
    } catch (error) {
      console.error('Error loading tags:', error)
    }
  }

  const handleStatusChange = async (newStatus) => {
    try {
      setLoading(true)
      if (task.id.startsWith('sample-')) {
        const updatedTask = { ...currentTask, status: newStatus }
        setCurrentTask(updatedTask)
        onUpdate(updatedTask)
        return
      }

      const updatedTask = await taskService.updateTask(task.id, {
        status: newStatus,
        completed_at: newStatus === 'completed' ? new Date().toISOString() : null
      })
      setCurrentTask(updatedTask)
      onUpdate(updatedTask)
    } catch (error) {
      console.error('Error updating task status:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setLoading(true)
      if (task.id.startsWith('sample-')) {
        const updatedTask = { ...currentTask, ...formData }
        setCurrentTask(updatedTask)
        onUpdate(updatedTask)
        setIsEditing(false)
        return
      }

      // Clean form data - convert empty strings to null for date/time fields
      const cleanedData = {
        ...formData,
        due_date: formData.due_date && formData.due_date.trim() ? formData.due_date : null,
        due_time: formData.due_time && formData.due_time.trim() ? formData.due_time : null,
        completed_at: formData.completed_at && formData.completed_at.trim() ? formData.completed_at : null
      }

      const updatedTask = await taskService.updateTask(task.id, cleanedData)
      setCurrentTask(updatedTask)
      onUpdate(updatedTask)
      setIsEditing(false)
    } catch (error) {
      console.error('Error updating task:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    try {
      setLoading(true)
      if (task.id.startsWith('sample-')) {
        onClose()
        // Notify parent to remove from list
        if (onUpdate) {
          onUpdate(null) // Signal deletion
        }
        return
      }

      await taskService.moveToTrash(task.id)
      onClose()
      // Notify parent to remove from list
      if (onUpdate) {
        onUpdate(null) // Signal deletion
      }
    } catch (error) {
      console.error('Error deleting task:', error)
    } finally {
      setLoading(false)
      setShowDeleteModal(false)
    }
  }

  const handleTagAdd = async (newTags) => {
    if (task.id.startsWith('sample-')) {
      const updatedTask = {
        ...currentTask,
        tags: newTags,
        task_tags: newTags.map(tag => ({ tags: tag }))
      }
      setCurrentTask(updatedTask)
      onUpdate(updatedTask)
      return
    }

    try {
      const currentTagIds = currentTags.map(t => t.id)
      const newTagIds = newTags.map(t => t.id)
      const tagsToAdd = newTagIds.filter(id => !currentTagIds.includes(id))
      const tagsToRemove = currentTagIds.filter(id => !newTagIds.includes(id))

      if (tagsToAdd.length > 0) {
        await taskService.addTagsToTask(task.id, tagsToAdd)
      }
      if (tagsToRemove.length > 0) {
        await taskService.removeTagsFromTask(task.id, tagsToRemove)
      }

      // Reload task to get updated tags
      const allTasks = await taskService.getAllTasks(user.id)
      const updatedTask = allTasks.find(t => t.id === task.id)
      if (updatedTask) {
        setCurrentTask(updatedTask)
        onUpdate(updatedTask)
      }
    } catch (error) {
      console.error('Error updating tags:', error)
    }
  }

  const handleTagRemove = async (tagToRemove) => {
    const newTags = currentTags.filter(t => t.id !== tagToRemove.id)
    await handleTagAdd(newTags)
  }

  const formatDate = (dateString) => {
    if (!dateString) return null
    try {
      const date = parseISO(dateString)
      return format(date, 'd MMM yyyy')
    } catch {
      return dateString
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-100 text-emerald-700'
      case 'in_progress':
        return 'bg-blue-100 text-blue-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700'
      case 'medium':
        return 'bg-yellow-100 text-yellow-700'
      default:
        return 'bg-green-100 text-green-700'
    }
  }

  return (
    <div className="space-y-6 pb-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-100">
        <button
          onClick={onClose}
          className="p-2 -ml-2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-xl font-semibold text-gray-900">Task Details</h1>
        <div className="w-9" /> {/* Spacer */}
      </div>

      {/* Task Title */}
      <div>
        {isEditing ? (
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            className="w-full text-lg font-semibold text-gray-900 px-3 py-2 border border-purple-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Task title"
          />
        ) : (
          <h2 className="text-lg font-semibold text-gray-900">{currentTask.title || 'Untitled Task'}</h2>
        )}
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        {isEditing ? (
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[100px] resize-none"
            placeholder="Add a description..."
          />
        ) : (
          <p className="text-gray-600 whitespace-pre-wrap">
            {currentTask.description || 'No description'}
          </p>
        )}
      </div>

      {/* Status */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Status
        </label>
        {isEditing ? (
          <div className="grid grid-cols-3 gap-2">
            {['todo', 'in_progress', 'completed'].map((status) => (
              <button
                key={status}
                onClick={() => setFormData(prev => ({ ...prev, status }))}
                className={`py-2 px-3 rounded-xl text-sm font-medium transition-colors ${
                  formData.status === status
                    ? getStatusColor(status)
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {status === 'todo' ? 'To Do' : status === 'in_progress' ? 'In Progress' : 'Completed'}
              </button>
            ))}
          </div>
        ) : (
          <button
            onClick={() => {
              const nextStatus = currentTask.status === 'todo' ? 'in_progress' : 
                                 currentTask.status === 'in_progress' ? 'completed' : 'todo'
              handleStatusChange(nextStatus)
            }}
            disabled={loading}
            className={`w-full py-3 px-4 rounded-xl font-medium transition-colors ${getStatusColor(currentTask.status)}`}
          >
            {currentTask.status === 'todo' ? 'To Do' : 
             currentTask.status === 'in_progress' ? 'In Progress' : 'Completed'}
          </button>
        )}
      </div>

      {/* Priority */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Priority
        </label>
        {isEditing ? (
          <div className="grid grid-cols-3 gap-2">
            {['low', 'medium', 'high'].map((priority) => (
              <button
                key={priority}
                onClick={() => setFormData(prev => ({ ...prev, priority }))}
                className={`py-2 px-3 rounded-xl text-sm font-medium transition-colors capitalize ${
                  formData.priority === priority
                    ? getPriorityColor(priority)
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {priority}
              </button>
            ))}
          </div>
        ) : (
          <span className={`inline-flex items-center px-3 py-2 rounded-full text-sm font-medium capitalize ${getPriorityColor(currentTask.priority)}`}>
            {currentTask.priority || 'medium'}
          </span>
        )}
      </div>

      {/* Due Date */}
      {(currentTask.due_date || isEditing) && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Due Date
          </label>
          {isEditing ? (
            <div className="grid grid-cols-2 gap-3">
              <input
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <input
                type="time"
                value={formData.due_time}
                onChange={(e) => setFormData(prev => ({ ...prev, due_time: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          ) : (
            <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-xl">
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-sm text-gray-700">
                {formatDate(currentTask.due_date) || 'No due date'}
                {currentTask.due_time && ` at ${currentTask.due_time}`}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Tags
        </label>
        {isEditing ? (
          <TagSelector
            selectedTags={currentTags}
            onTagsChange={handleTagAdd}
            placeholder="Add tags..."
          />
        ) : (
          <div className="flex flex-wrap gap-2">
            {currentTags.length > 0 ? (
              currentTags.map((tag) => (
                <TagPill
                  key={tag.id}
                  tag={tag}
                  size="sm"
                  removable={false}
                />
              ))
            ) : (
              <span className="text-sm text-gray-500">No tags</span>
            )}
          </div>
        )}
      </div>

      {/* Subtasks */}
      <SubtaskList task={currentTask} onUpdate={(updatedTask) => {
        setCurrentTask(updatedTask)
        onUpdate(updatedTask)
      }} />

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t border-gray-100">
        {isEditing ? (
          <>
            <button
              onClick={handleSave}
              disabled={loading || !formData.title.trim()}
              className="flex-1 bg-purple-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              onClick={() => {
                setIsEditing(false)
                setFormData({
                  title: currentTask.title || '',
                  description: currentTask.description || '',
                  status: currentTask.status || 'todo',
                  priority: currentTask.priority || 'medium',
                  due_date: currentTask.due_date ? currentTask.due_date.split('T')[0] : '',
                  due_time: currentTask.due_time || ''
                })
              }}
              className="px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setIsEditing(true)}
              className="flex-1 bg-purple-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-purple-700 transition-colors"
            >
              Edit Task
            </button>
            <button
              onClick={() => setShowDeleteModal(true)}
              disabled={loading}
              className="p-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Task"
        message="Are you sure you want to delete this task? It will be moved to trash."
        confirmText="Delete"
        cancelText="Cancel"
        confirmColor="bg-red-600 hover:bg-red-700"
        isLoading={loading}
      />
    </div>
  )
}
