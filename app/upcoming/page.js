'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/lib/auth'
import { taskService } from '@/lib/supabase'
import TaskCard from '@/components/ui/TaskCard'
import BottomSheet from '@/components/ui/BottomSheet'
import TaskDetail from '@/components/features/TaskDetail'
import SearchBar from '@/components/ui/SearchBar'
import QuickFilter from '@/components/ui/QuickFilter'

export default function UpcomingPage() {
  const { user, loading } = useAuth()
  const [tasks, setTasks] = useState([])
  const [selectedTask, setSelectedTask] = useState(null)
  const [tasksLoading, setTasksLoading] = useState(true)
  const [activeFilters, setActiveFilters] = useState([])
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (user) {
      loadUpcomingTasks()
    }
  }, [user])

  const loadUpcomingTasks = async () => {
    try {
      setTasksLoading(true)
      const upcomingTasks = await taskService.getUpcomingTasks(user.id)
      setTasks(upcomingTasks)
    } catch (error) {
      console.error('Error loading upcoming tasks:', error)
    } finally {
      setTasksLoading(false)
    }
  }

  const handleTaskClick = (task) => {
    setSelectedTask(task)
  }

  const handleTaskUpdate = async (updatedTask) => {
    if (!updatedTask) {
      // Task was deleted, remove it from the list
      const deletedTaskId = selectedTask?.id
      if (deletedTaskId) {
        setTasks(prev => prev.filter(task => task.id !== deletedTaskId))
      }
      setSelectedTask(null)
      // Reload to refresh the list
      loadUpcomingTasks()
      return
    }
    
    setTasks(prev => 
      prev.map(task => 
        task.id === updatedTask.id ? updatedTask : task
      )
    )
    setSelectedTask(null)
    // Reload to refresh the list
    loadUpcomingTasks()
  }

  // Handle search - client-side filtering
  const handleSearch = (query) => {
    setSearchQuery(query)
  }

  // Filter tasks based on search query and active filters
  const filteredTasks = tasks.filter(task => {
    // First, apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      const matchesTitle = task.title?.toLowerCase().includes(query)
      const matchesDescription = task.description?.toLowerCase().includes(query)
      
      // Check if search matches any tag names
      const matchesTags = task.task_tags?.some(taskTag => 
        taskTag.tags?.name?.toLowerCase().includes(query)
      ) || false
      
      // Check if search matches any subtask titles
      const matchesSubtasks = task.subtasks?.some(subtask => 
        subtask.title?.toLowerCase().includes(query)
      ) || false
      
      // If search doesn't match, exclude this task
      if (!matchesTitle && !matchesDescription && !matchesTags && !matchesSubtasks) {
        return false
      }
    }

    // Then, apply active filters
    if (activeFilters.length === 0) return true

    return activeFilters.every(filter => {
      switch (filter.type) {
        case 'status':
          if (filter.id === 'all') return true
          return task.status === filter.id
        case 'priority':
          if (filter.id === 'high_priority') return task.priority === 'high'
          return task.priority === filter.id
        case 'tag':
          if (task.task_tags) {
            return task.task_tags.some(taskTag => taskTag.tags?.id === filter.id)
          }
          if (task.tags && Array.isArray(task.tags)) {
            return task.tags.some(tag => tag.id === filter.id || tag.name === filter.tag?.name)
          }
          return false
        default:
          return true
      }
    })
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-6">
        <h1 className="text-xl font-semibold text-gray-900 mb-4">Please sign in</h1>
        <a href="/auth/login" className="btn-primary">Sign In</a>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-mint-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-b-3xl p-6 text-white mb-6">
        <h1 className="text-2xl font-bold mb-2">Upcoming Tasks</h1>
        <p className="text-white/80">Tasks scheduled for the future</p>
      </div>

      {/* Search and Filters */}
      <div className="px-6 mb-4">
        <div className="mb-4">
          <SearchBar
            onSearch={handleSearch}
            placeholder="Search upcoming tasks..."
            showResults={false}
          />
        </div>
        <QuickFilter
          activeFilters={activeFilters}
          onFiltersChange={setActiveFilters}
        />
      </div>

      {/* Result Count */}
      {!tasksLoading && (searchQuery.trim() || activeFilters.length > 0) && (
        <div className="px-6 mb-4 text-sm text-gray-600">
          Showing {filteredTasks.length} of {tasks.length} tasks
          {(searchQuery.trim() || activeFilters.length > 0) && (
            <button
              onClick={() => {
                setSearchQuery('')
                setActiveFilters([])
              }}
              className="ml-2 text-purple-600 hover:text-purple-700 font-medium"
            >
              Clear all
            </button>
          )}
        </div>
      )}

      {/* Upcoming Tasks */}
      <div className="px-6 pb-20">
        {tasksLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-2xl p-4 animate-pulse shadow-sm">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : filteredTasks.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-8 text-center shadow-sm border border-gray-100"
          >
            <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchQuery.trim() ? 'No tasks match your search' : 'No upcoming tasks'}
            </h3>
            <p className="text-gray-600">
              {searchQuery.trim() 
                ? 'Try searching for something else or clear your search'
                : 'All your future tasks will appear here.'}
            </p>
          </motion.div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {filteredTasks.map((task, index) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <TaskCard
                    task={task}
                    onClick={handleTaskClick}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

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
    </div>
  )
}
