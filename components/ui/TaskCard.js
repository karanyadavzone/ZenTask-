'use client'

import { useState, useRef } from 'react'
import { format, isToday, isTomorrow } from 'date-fns'
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion'
import { useAuth } from '@/lib/auth'

export default function TaskCard({ task, onClick, onLongPress, onSwipeRight, onSwipeLeft }) {
  const { user } = useAuth()
  const [isDragging, setIsDragging] = useState(false)
  const x = useMotionValue(0)
  const opacity = useTransform(x, [-200, 0, 200], [0, 1, 0])
  const scale = useTransform(x, [-200, 0, 200], [0.9, 1, 0.9])

  // Define task card styles based on priority and status
  const getTaskCardStyle = (task) => {
    if (task.status === 'completed') {
      return 'bg-emerald-100 border-emerald-200'
    }
    
    switch (task.priority) {
      case 'high':
        return 'bg-red-50 border-red-200'
      case 'medium':
        return 'bg-emerald-100 border-emerald-200'  
      case 'low':
        return 'bg-blue-50 border-blue-200'
      default:
        return 'bg-gray-50 border-gray-200'
    }
  }

  const formatTaskTime = (dueDate, dueTime) => {
    if (!dueDate) return null
    
    const date = new Date(dueDate)
    let timeStr = format(date, 'd MMM yyyy')
    
    if (dueTime) {
      const [hours, minutes] = dueTime.split(':')
      const time = new Date()
      time.setHours(parseInt(hours), parseInt(minutes))
      timeStr += ` ${format(time, 'h:mm a')}`
    }
    
    return timeStr
  }

  const handleDragStart = () => {
    setIsDragging(true)
  }

  const handleDragEnd = (event, info) => {
    setIsDragging(false)
    const threshold = 100

    if (info.offset.x > threshold && onSwipeRight) {
      // Swipe right - complete task
      onSwipeRight(task)
      x.set(0)
    } else if (info.offset.x < -threshold && onSwipeLeft) {
      // Swipe left - delete task
      onSwipeLeft(task)
      x.set(0)
    } else {
      // Snap back
      x.set(0)
    }
  }

  const handleClick = (e) => {
    // Don't trigger onClick if we just swiped
    if (!isDragging && onClick) {
      onClick(task)
    }
  }

  const handleTouchStart = (e) => {
    if (onLongPress) {
      const timer = setTimeout(() => {
        onLongPress(task)
      }, 500)
      
      const handleTouchEnd = () => {
        clearTimeout(timer)
        document.removeEventListener('touchend', handleTouchEnd)
      }
      
      document.addEventListener('touchend', handleTouchEnd)
    }
  }

  // Get tags from task
  const taskTags = task.task_tags?.map(tt => tt.tags) || task.tags || []

  return (
    <div className="relative">
      {/* Swipe Actions Background */}
      <div className="absolute inset-0 flex items-center justify-between px-4 rounded-2xl pointer-events-none">
        {/* Swipe Right Action (Complete) */}
        <motion.div
          className="flex items-center text-emerald-600"
          style={{ opacity: useTransform(x, [0, 100], [0, 1]) }}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="ml-2 font-medium">Complete</span>
        </motion.div>

        {/* Swipe Left Action (Delete) */}
        <motion.div
          className="flex items-center text-red-600"
          style={{ opacity: useTransform(x, [-100, 0], [1, 0]) }}
        >
          <span className="mr-2 font-medium">Delete</span>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </motion.div>
      </div>

      {/* Task Card */}
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        style={{ x, opacity, scale }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        whileTap={{ scale: isDragging ? 1 : 0.98 }}
        className={`
          ${getTaskCardStyle(task)}
          bg-white rounded-2xl p-4 shadow-sm border-2 touch-manipulation cursor-pointer relative z-10
          ${task.status === 'completed' ? 'opacity-70' : ''}
          hover:shadow-md transition-all duration-200
        `}
        onClick={handleClick}
        onTouchStart={handleTouchStart}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className={`
              font-semibold text-base leading-tight mb-2
              ${task.status === 'completed' ? 'line-through text-gray-500' : 'text-gray-900'}
            `}>
              {task.title}
            </h3>
            
            {task.description && (
              <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                {task.description}
              </p>
            )}

            {/* Date and Time */}
            {task.due_date && (
              <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {formatTaskTime(task.due_date, task.due_time) || 'No due date'}
                </div>
              </div>
            )}

            {/* Subtasks Progress */}
            {task.subtasks && task.subtasks.length > 0 && (
              <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  {task.subtasks.filter(st => st.completed).length} / {task.subtasks.length}
                </div>
              </div>
            )}
          </div>
          
          <div className="flex flex-col items-end space-y-2 ml-4">
            {/* Status Indicator */}
            <div className={`
              w-3 h-3 rounded-full
              ${task.status === 'completed' ? 'bg-emerald-500' : 
                task.status === 'in_progress' ? 'bg-blue-500' : 
                'bg-gray-400'}
            `} />

            {/* Avatar */}
            <div className="w-6 h-6 bg-purple-100 rounded-full border-2 border-white flex items-center justify-center">
              <span className="text-xs text-purple-600 font-medium">
                {user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
              </span>
            </div>
          </div>
        </div>

        {/* Tags Row */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2 flex-wrap">
            {/* Priority Tag */}
            <span className={`
              inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
              ${task.priority === 'high' ? 'bg-red-100 text-red-700' : 
                task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                'bg-green-100 text-green-700'}
            `}>
              {task.priority === 'high' ? 'High' : task.priority === 'medium' ? 'Medium' : 'Low'}
            </span>

            {/* Custom Tags */}
            {taskTags.map((tag, index) => (
              <span
                key={tag.id || index}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                style={{ 
                  backgroundColor: tag.color + '20', 
                  color: tag.color 
                }}
              >
                {tag.name}
              </span>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
