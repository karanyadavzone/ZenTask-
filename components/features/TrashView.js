'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/lib/auth'
import { taskService } from '@/lib/supabase'
import TaskCard from '@/components/ui/TaskCard'
import BottomSheet from '@/components/ui/BottomSheet'
import TaskDetail from './TaskDetail'
import ConfirmModal from '@/components/ui/ConfirmModal'
import { format } from 'date-fns'

export default function TrashView() {
  const { user } = useAuth()
  const [trashedTasks, setTrashedTasks] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedTask, setSelectedTask] = useState(null)
  const [deleteTaskId, setDeleteTaskId] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  useEffect(() => {
    if (user) {
      loadTrashedTasks()
    }
  }, [user])

  const loadTrashedTasks = async () => {
    try {
      setLoading(true)
      const tasks = await taskService.getTrashedTasks(user.id)
      setTrashedTasks(tasks)
    } catch (error) {
      console.error('Error loading trashed tasks:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRestore = async (taskId) => {
    try {
      await taskService.restoreFromTrash(taskId)
      setTrashedTasks(prev => prev.filter(t => t.id !== taskId))
    } catch (error) {
      console.error('Error restoring task:', error)
    }
  }

  const handlePermanentDelete = async () => {
    if (!deleteTaskId) return

    try {
      setLoading(true)
      await taskService.permanentlyDeleteTask(deleteTaskId)
      setTrashedTasks(prev => prev.filter(t => t.id !== deleteTaskId))
      setDeleteTaskId(null)
      setShowDeleteModal(false)
    } catch (error) {
      console.error('Error permanently deleting task:', error)
    } finally {
      setLoading(false)
    }
  }

  const openDeleteModal = (taskId) => {
    setDeleteTaskId(taskId)
    setShowDeleteModal(true)
  }

  const handleTaskClick = (task) => {
    setSelectedTask(task)
  }

  const handleTaskUpdate = async (updatedTask) => {
    setTrashedTasks(prev => 
      prev.map(task => 
        task.id === updatedTask.id ? updatedTask : task
      )
    )
    setSelectedTask(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Trash</h2>
        {trashedTasks.length > 0 && (
          <span className="text-sm text-gray-500">{trashedTasks.length} items</span>
        )}
      </div>

      {trashedTasks.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-8 text-center shadow-sm border border-gray-100"
        >
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Trash is empty</h3>
          <p className="text-gray-500">Deleted tasks will appear here</p>
        </motion.div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {trashedTasks.map((task, index) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
                className="relative"
              >
                <TaskCard
                  task={task}
                  onClick={handleTaskClick}
                />
                <div className="absolute top-2 right-2 flex gap-2">
                  <button
                    onClick={() => handleRestore(task.id)}
                    className="p-2 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors"
                    title="Restore"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </button>
                  <button
                    onClick={() => openDeleteModal(task.id)}
                    className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                    title="Delete permanently"
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

      {/* Task Detail Bottom Sheet */}
      <BottomSheet
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        title="Task Details"
      >
        {selectedTask && (
          <TaskDetail
            task={selectedTask}
            onUpdate={handleTaskUpdate}
            onClose={() => setSelectedTask(null)}
          />
        )}
      </BottomSheet>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false)
          setDeleteTaskId(null)
        }}
        onConfirm={handlePermanentDelete}
        title="Permanently Delete Task"
        message="Are you sure you want to permanently delete this task? This action cannot be undone."
        confirmText="Delete Forever"
        cancelText="Cancel"
        confirmColor="bg-red-600 hover:bg-red-700"
        isLoading={loading}
      />
    </div>
  )
}

