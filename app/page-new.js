'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/lib/auth'
import { taskService } from '@/lib/supabase'
import TaskCard from '@/components/ui/TaskCard'
import BottomSheet from '@/components/ui/BottomSheet'
import TaskDetail from '@/components/features/TaskDetail'
import CreateTask from '@/components/features/CreateTask'
import { format } from 'date-fns'

export default function TodayPage() {
  const { user, loading } = useAuth()
  const [tasks, setTasks] = useState([])
  const [selectedTask, setSelectedTask] = useState(null)
  const [showCreateTask, setShowCreateTask] = useState(false)
  const [tasksLoading, setTasksLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState('all')

  // Sample tasks for demo
  const sampleTasks = [
    {
      id: 'sample-1',
      title: 'Dashboard design for admin',
      description: 'Create admin dashboard with analytics',
      status: 'in_progress',
      priority: 'high',
      due_date: '2022-10-14',
      created_at: new Date().toISOString(),
      tags: [{ name: 'On Track', color: '#F59E0B' }, { name: 'High', color: '#EF4444' }]
    },
    {
      id: 'sample-2', 
      title: 'Konom web application',
      description: 'Build responsive web application',
      status: 'todo',
      priority: 'low',
      due_date: '2022-11-14',
      created_at: new Date().toISOString(),
      tags: [{ name: 'Meeting', color: '#8B5CF6' }]
    },
    {
      id: 'sample-3',
      title: 'Research and development',
      description: 'Market research for new features',
      status: 'in_progress',
      priority: 'medium',
      due_date: '2022-10-14',
      created_at: new Date().toISOString(),
      tags: [{ name: 'At Risk', color: '#EF4444' }]
    },
    {
      id: 'sample-4',
      title: 'Event booking application',
      description: 'Mobile app for event management',
      status: 'todo',
      priority: 'medium',
      due_date: '2022-10-14',
      created_at: new Date().toISOString(),
      tags: [{ name: 'Meeting', color: '#8B5CF6' }]
    }
  ]

  // Load today's tasks
  useEffect(() => {
    if (user) {
      loadTodaysTasks()
    } else {
      // Show sample tasks when not logged in
      setTasks(sampleTasks)
      setTasksLoading(false)
    }
  }, [user])

  const loadTodaysTasks = async () => {
    try {
      setTasksLoading(true)
      const allTasks = await taskService.getAllTasks(user.id)
      
      if (allTasks.length === 0) {
        // If no tasks exist, show sample tasks
        setTasks(sampleTasks)
      } else {
        setTasks(allTasks)
      }
    } catch (error) {
      console.error('Error loading tasks:', error)
      // Fallback to sample tasks on error
      setTasks(sampleTasks)
    } finally {
      setTasksLoading(false)
    }
  }

  const handleTaskClick = (task) => {
    setSelectedTask(task)
  }

  const handleTaskUpdate = async (updatedTask) => {
    setTasks(prev => 
      prev.map(task => 
        task.id === updatedTask.id ? updatedTask : task
      )
    )
    setSelectedTask(null)
  }

  const handleTaskCreate = async (newTask) => {
    setTasks(prev => [newTask, ...prev])
    setShowCreateTask(false)
  }

  const handleQuickComplete = async (task) => {
    try {
      if (user && task.id.startsWith('sample-')) {
        // Handle sample task toggle
        setTasks(prev => 
          prev.map(t => 
            t.id === task.id 
              ? { ...t, status: t.status === 'completed' ? 'todo' : 'completed' }
              : t
          )
        )
        return
      }

      const updatedTask = await taskService.updateTask(task.id, {
        status: task.status === 'completed' ? 'todo' : 'completed',
        completed_at: task.status === 'completed' ? null : new Date().toISOString()
      })
      
      setTasks(prev => 
        prev.map(t => t.id === task.id ? updatedTask : t)
      )
    } catch (error) {
      console.error('Error updating task:', error)
    }
  }

  // Filter tasks based on active filter
  const filteredTasks = tasks.filter(task => {
    switch(activeFilter) {
      case 'completed':
        return task.status === 'completed'
      case 'todo':
        return task.status === 'todo'
      case 'in_review':
        return task.status === 'in_progress'
      default:
        return true
    }
  })

  const completedCount = tasks.filter(task => task.status === 'completed').length
  const todoCount = tasks.filter(task => task.status === 'todo').length
  const inReviewCount = tasks.filter(task => task.status === 'in_progress').length

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white px-6 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h1 className="text-xl font-semibold text-gray-900">Task List</h1>
          </div>
          
          <div className="flex items-center space-x-2">
            <button className="p-2 text-gray-400 hover:text-gray-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center space-x-2 mt-4">
          <button
            onClick={() => setActiveFilter('completed')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activeFilter === 'completed' 
                ? 'bg-emerald-100 text-emerald-700' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <span>Complete</span>
            <span className="bg-emerald-600 text-white text-xs px-2 py-0.5 rounded-full min-w-[20px]">
              {completedCount}
            </span>
          </button>
          
          <button
            onClick={() => setActiveFilter('todo')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activeFilter === 'todo' 
                ? 'bg-blue-100 text-blue-700' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <span>To Do</span>
            <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full min-w-[20px]">
              {todoCount}
            </span>
          </button>
          
          <button
            onClick={() => setActiveFilter('in_review')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activeFilter === 'in_review' 
                ? 'bg-purple-100 text-purple-700' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <span>In Review</span>
            <span className="bg-purple-600 text-white text-xs px-2 py-0.5 rounded-full min-w-[20px]">
              {inReviewCount}
            </span>
          </button>
        </div>
      </div>

      {/* Task List */}
      <div className="px-6 py-4">
        {tasksLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map(i => (
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
            className="bg-white rounded-2xl p-8 text-center shadow-sm"
          >
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No tasks found
            </h3>
            <p className="text-gray-500 mb-6">
              {activeFilter === 'all' ? 'Create your first task to get started' : `No ${activeFilter} tasks yet`}
            </p>
            <button
              onClick={() => setShowCreateTask(true)}
              className="bg-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-purple-700 transition-colors"
            >
              Add Task
            </button>
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
                  transition={{ delay: index * 0.05 }}
                >
                  <TaskCard
                    task={task}
                    onClick={handleTaskClick}
                    onLongPress={handleQuickComplete}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Floating Add Button */}
      <button
        onClick={() => setShowCreateTask(true)}
        className="fixed bottom-24 right-6 w-14 h-14 bg-purple-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:bg-purple-700 active:scale-90 transition-all z-20"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>

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

      {/* Create Task Bottom Sheet */}
      <BottomSheet
        isOpen={showCreateTask}
        onClose={() => setShowCreateTask(false)}
        title="Create Task"
      >
        <CreateTask
          onCreate={handleTaskCreate}
          onClose={() => setShowCreateTask(false)}
        />
      </BottomSheet>
    </div>
  )
}

