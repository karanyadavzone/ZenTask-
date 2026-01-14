'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { subtaskService } from '@/lib/supabase'
import SubtaskItem from './SubtaskItem'
import SubtaskInput from './SubtaskInput'

export default function SubtaskList({ task, onUpdate }) {
  const [subtasks, setSubtasks] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (task) {
      loadSubtasks()
    }
  }, [task?.id])

  const loadSubtasks = async () => {
    if (task.id.startsWith('sample-')) {
      // Handle sample tasks
      setSubtasks(task.subtasks || [])
      return
    }

    try {
      setLoading(true)
      const taskSubtasks = await subtaskService.getTaskSubtasks(task.id)
      setSubtasks(taskSubtasks)
    } catch (error) {
      console.error('Error loading subtasks:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateSubtask = async (title) => {
    if (!title.trim()) return

    const newSubtask = {
      title: title.trim(),
      completed: false,
      order_index: subtasks.length
    }

    if (task.id.startsWith('sample-')) {
      // Handle sample task
      const updatedSubtasks = [...subtasks, { ...newSubtask, id: `subtask-${Date.now()}` }]
      setSubtasks(updatedSubtasks)
      if (onUpdate) {
        onUpdate({ ...task, subtasks: updatedSubtasks })
      }
      return
    }

    try {
      const created = await subtaskService.createSubtask(task.id, newSubtask)
      setSubtasks(prev => [...prev, created])
    } catch (error) {
      console.error('Error creating subtask:', error)
    }
  }

  const handleUpdateSubtask = async (subtaskId, updates) => {
    if (task.id.startsWith('sample-')) {
      // Handle sample task
      const updatedSubtasks = subtasks.map(st => 
        st.id === subtaskId ? { ...st, ...updates } : st
      )
      setSubtasks(updatedSubtasks)
      if (onUpdate) {
        onUpdate({ ...task, subtasks: updatedSubtasks })
      }
      return
    }

    try {
      const updated = await subtaskService.updateSubtask(subtaskId, updates)
      setSubtasks(prev => prev.map(st => st.id === subtaskId ? updated : st))
    } catch (error) {
      console.error('Error updating subtask:', error)
    }
  }

  const handleDeleteSubtask = async (subtaskId) => {
    if (task.id.startsWith('sample-')) {
      // Handle sample task
      const updatedSubtasks = subtasks.filter(st => st.id !== subtaskId)
      setSubtasks(updatedSubtasks)
      if (onUpdate) {
        onUpdate({ ...task, subtasks: updatedSubtasks })
      }
      return
    }

    try {
      await subtaskService.deleteSubtask(subtaskId)
      setSubtasks(prev => prev.filter(st => st.id !== subtaskId))
    } catch (error) {
      console.error('Error deleting subtask:', error)
    }
  }

  const completedCount = subtasks.filter(st => st.completed).length
  const totalCount = subtasks.length
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0

  return (
    <div className="space-y-3">
      {/* Header with Progress */}
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          Subtasks
        </label>
        {totalCount > 0 && (
          <span className="text-xs text-gray-500">
            {completedCount} of {totalCount} completed
          </span>
        )}
      </div>

      {/* Progress Bar */}
      {totalCount > 0 && (
        <div className="w-full bg-gray-200 rounded-full h-2">
          <motion.div
            className="bg-purple-600 h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      )}

      {/* Subtasks List */}
      <div className="space-y-2">
        <AnimatePresence>
          {subtasks.map((subtask, index) => (
            <motion.div
              key={subtask.id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ delay: index * 0.05 }}
            >
              <SubtaskItem
                subtask={subtask}
                onToggle={(completed) => handleUpdateSubtask(subtask.id, { completed })}
                onUpdate={(title) => handleUpdateSubtask(subtask.id, { title })}
                onDelete={() => handleDeleteSubtask(subtask.id)}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Add Subtask Input */}
      <SubtaskInput onCreate={handleCreateSubtask} />
    </div>
  )
}


