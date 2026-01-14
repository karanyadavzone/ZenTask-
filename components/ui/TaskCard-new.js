'use client'

import { format, isToday, isTomorrow } from 'date-fns'
import { motion } from 'framer-motion'
import { useAuth } from '@/lib/auth'

export default function TaskCard({ task, onClick, onLongPress }) {
  const { user } = useAuth()

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileTap={{ scale: 0.98 }}
      className={`
        ${getTaskCardStyle(task)}
        bg-white rounded-2xl p-4 shadow-sm border-2 touch-manipulation cursor-pointer
        ${task.status === 'completed' ? 'opacity-70' : ''}
        hover:shadow-md transition-all duration-200
      `}
      onClick={() => onClick(task)}
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
          <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {formatTaskTime(task.due_date, task.due_time) || 'No due date'}
            </div>
          </div>

          {/* Stats Row */}
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              5
            </div>
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              5
            </div>
          </div>
        </div>
        
        <div className="flex flex-col items-end space-y-2 ml-4">
          {/* Three dots menu */}
          <button className="p-1 text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>

          {/* Avatar Stack */}
          <div className="flex -space-x-1">
            <div className="w-6 h-6 bg-purple-100 rounded-full border-2 border-white flex items-center justify-center">
              <span className="text-xs text-purple-600 font-medium">
                {user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
              </span>
            </div>
            <div className="w-6 h-6 bg-blue-100 rounded-full border-2 border-white flex items-center justify-center">
              <span className="text-xs text-blue-600 font-medium">+</span>
            </div>
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
          {task.tags && task.tags.map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
              style={{ 
                backgroundColor: tag.color + '20', 
                color: tag.color 
              }}
            >
              {tag.name}
            </span>
          ))}

          {/* Default tags for sample tasks */}
          {task.id === 'sample-1' && (
            <>
              <span className="bg-orange-100 text-orange-700 text-xs font-medium px-2 py-1 rounded-full">
                On Track
              </span>
            </>
          )}
          {task.id === 'sample-2' && (
            <span className="bg-purple-100 text-purple-700 text-xs font-medium px-2 py-1 rounded-full">
              Meeting
            </span>
          )}
          {task.id === 'sample-3' && (
            <span className="bg-red-100 text-red-700 text-xs font-medium px-2 py-1 rounded-full">
              At Risk
            </span>
          )}
          {task.id === 'sample-4' && (
            <span className="bg-purple-100 text-purple-700 text-xs font-medium px-2 py-1 rounded-full">
              Meeting
            </span>
          )}
        </div>
      </div>
    </motion.div>
  )
}

