'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/lib/auth'
import { taskService } from '@/lib/supabase'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, addMonths, subMonths, startOfWeek, endOfWeek, parseISO } from 'date-fns'
import TaskCard from '@/components/ui/TaskCard'
import BottomSheet from '@/components/ui/BottomSheet'
import TaskDetail from '@/components/features/TaskDetail'
import { useRouter } from 'next/navigation'

export default function CalendarPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [tasks, setTasks] = useState([])
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedTask, setSelectedTask] = useState(null)
  const [tasksLoading, setTasksLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadAllTasks()
    }
  }, [user])

  const loadAllTasks = async () => {
    try {
      setTasksLoading(true)
      const allTasks = await taskService.getAllTasks(user.id)
      setTasks(allTasks)
    } catch (error) {
      console.error('Error loading tasks:', error)
    } finally {
      setTasksLoading(false)
    }
  }

  // Get all days in the calendar view
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(currentMonth)
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 })
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 })
    
    return eachDayOfInterval({ start: calendarStart, end: calendarEnd })
  }, [currentMonth])

  // Group tasks by date
  const tasksByDate = useMemo(() => {
    const grouped = {}
    tasks.forEach(task => {
      if (task.due_date) {
        try {
          const dateKey = format(parseISO(task.due_date), 'yyyy-MM-dd')
          if (!grouped[dateKey]) {
            grouped[dateKey] = []
          }
          grouped[dateKey].push(task)
        } catch (e) {
          // Skip invalid dates
        }
      }
    })
    return grouped
  }, [tasks])

  // Get tasks for selected date
  const selectedDateTasks = useMemo(() => {
    const dateKey = format(selectedDate, 'yyyy-MM-dd')
    return tasksByDate[dateKey] || []
  }, [selectedDate, tasksByDate])

  const goToPreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1))
  }

  const goToNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1))
  }

  const goToToday = () => {
    const today = new Date()
    setCurrentMonth(today)
    setSelectedDate(today)
  }

  const handleTaskClick = (task) => {
    setSelectedTask(task)
  }

  const handleTaskUpdate = async (updatedTask) => {
    if (!updatedTask) {
      // Task was deleted
      loadAllTasks()
      setSelectedTask(null)
      return
    }
    
    setTasks(prev => 
      prev.map(task => 
        task.id === updatedTask.id ? updatedTask : task
      )
    )
    setSelectedTask(null)
    loadAllTasks()
  }

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-b-3xl p-6 text-white mb-6">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => router.push('/')}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-2xl font-bold">Calendar</h1>
          <div className="w-9" />
        </div>

        {/* Month Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={goToPreviousMonth}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold">
              {format(currentMonth, 'MMMM yyyy')}
            </h2>
            <button
              onClick={goToToday}
              className="px-3 py-1 bg-white/20 text-white rounded-full text-sm hover:bg-white/30 transition-colors"
            >
              Today
            </button>
          </div>
          
          <button
            onClick={goToNextMonth}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="px-6 mb-6">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          {/* Week Days Header */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {weekDays.map((day) => (
              <div
                key={day}
                className="text-center text-xs font-semibold text-gray-600 py-2"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((date, index) => {
              const isCurrentMonth = isSameMonth(date, currentMonth)
              const isCurrentDay = isToday(date)
              const isSelected = isSameDay(date, selectedDate)
              const dateKey = format(date, 'yyyy-MM-dd')
              const dayTasks = tasksByDate[dateKey] || []
              const taskCount = dayTasks.length

              return (
                <motion.button
                  key={date.toISOString()}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.01 }}
                  onClick={() => setSelectedDate(date)}
                  className={`
                    relative p-3 rounded-xl text-sm font-medium transition-all min-h-[60px] flex flex-col items-center justify-start
                    ${isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}
                    ${isCurrentDay 
                      ? 'bg-purple-100 text-purple-700 font-semibold ring-2 ring-purple-500' 
                      : isSelected
                        ? 'bg-purple-50 text-purple-600 ring-2 ring-purple-300'
                        : 'hover:bg-gray-50'
                    }
                  `}
                >
                  <span className={isCurrentDay ? 'font-bold' : ''}>
                    {format(date, 'd')}
                  </span>
                  
                  {/* Task Indicators */}
                  {taskCount > 0 && (
                    <div className="mt-1 flex flex-wrap gap-0.5 justify-center">
                      {dayTasks.slice(0, 4).map((task) => (
                        <div
                          key={task.id}
                          className={`
                            w-1.5 h-1.5 rounded-full
                            ${task.priority === 'high' ? 'bg-red-500' :
                              task.priority === 'medium' ? 'bg-yellow-500' :
                              'bg-green-500'}
                          `}
                        />
                      ))}
                      {taskCount > 4 && (
                        <div className="text-xs text-gray-500">+{taskCount - 4}</div>
                      )}
                    </div>
                  )}
                </motion.button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Selected Date Tasks */}
      <div className="px-6 pb-20">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {format(selectedDate, 'EEEE, MMMM d, yyyy')}
          </h3>
          <p className="text-sm text-gray-500">
            {selectedDateTasks.length === 0 
              ? 'No tasks scheduled' 
              : `${selectedDateTasks.length} task${selectedDateTasks.length !== 1 ? 's' : ''} scheduled`}
          </p>
        </div>

        {tasksLoading ? (
          <div className="space-y-3">
            {[1, 2].map(i => (
              <div key={i} className="bg-white rounded-2xl p-4 animate-pulse shadow-sm">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : selectedDateTasks.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-8 text-center shadow-sm border border-gray-100"
          >
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks for this day</h3>
            <p className="text-gray-500">Select another date or create a new task</p>
          </motion.div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {selectedDateTasks.map((task, index) => (
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

