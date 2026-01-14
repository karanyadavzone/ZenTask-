'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth'
import { taskService } from '@/lib/supabase'
import TagSelector from '@/components/ui/TagSelector'

export default function CreateTask({ onCreate, onClose }) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium'
  })
  const [selectedTags, setSelectedTags] = useState([])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.title.trim()) return

    try {
      setLoading(true)
      
      const taskData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        priority: formData.priority,
        status: 'todo'
      }

      const newTask = await taskService.createTask(user.id, taskData)
      
      // Add tags to the task if any are selected
      if (selectedTags.length > 0) {
        const tagIds = selectedTags.map(tag => tag.id)
        await taskService.addTagsToTask(newTask.id, tagIds)
        
        // Update the task with tags for the UI
        newTask.task_tags = selectedTags.map(tag => ({ tags: tag }))
      }
      
      onCreate(newTask)
    } catch (error) {
      console.error('Error creating task:', error)
    } finally {
      setLoading(false)
    }
  }

  const priorityOptions = [
    { value: 'low', label: 'Low', color: 'bg-sage-100 text-sage-700' },
    { value: 'medium', label: 'Medium', color: 'bg-lavender-100 text-lavender-700' },
    { value: 'high', label: 'High', color: 'bg-red-100 text-red-700' }
  ]


  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Task Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Task Title *
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          className="input"
          placeholder="What needs to be done?"
          required
          autoFocus
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          className="input min-h-[80px] resize-none"
          placeholder="Add more details..."
          rows={3}
        />
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tags
        </label>
        <TagSelector
          selectedTags={selectedTags}
          onTagsChange={setSelectedTags}
          placeholder="Add tags to organize your task..."
        />
      </div>

      {/* Priority */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Priority
        </label>
        <div className="grid grid-cols-3 gap-2">
          {priorityOptions.map(option => (
            <button
              key={option.value}
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, priority: option.value }))}
              className={`p-3 rounded-xl text-sm font-medium transition-colors ${
                formData.priority === option.value
                  ? option.color
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>


      {/* Actions */}
      <div className="flex gap-3 pt-6">
        <button
          type="submit"
          disabled={loading || !formData.title.trim()}
          className="btn-primary flex-1"
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Creating...
            </div>
          ) : (
            'Create Task'
          )}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="btn-secondary"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}

