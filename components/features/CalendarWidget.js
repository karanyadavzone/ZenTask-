'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, addMonths, subMonths, startOfWeek, endOfWeek } from 'date-fns'

export default function CalendarWidget({ tasks = [], onDateSelect, selectedDate = null }) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  
  // Get all days in the calendar view (including previous/next month days)
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
        const dateKey = format(new Date(task.due_date), 'yyyy-MM-dd')
        if (!grouped[dateKey]) {
          grouped[dateKey] = []
        }
        grouped[dateKey].push(task)
      }
    })
    return grouped
  }, [tasks])

  // Get task count for a specific date
  const getTaskCount = (date) => {
    const dateKey = format(date, 'yyyy-MM-dd')
    return tasksByDate[dateKey]?.length || 0
  }

  // Navigate months
  const goToPreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1))
  }

  const goToNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1))
  }

  const goToToday = () => {
    setCurrentMonth(new Date())
  }

  const handleDateClick = (date) => {
    if (onDateSelect) {
      onDateSelect(date)
    }
  }

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={goToPreviousMonth}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-gray-900">
            {format(currentMonth, 'MMMM yyyy')}
          </h3>
          <button
            onClick={goToToday}
            className="px-3 py-1 text-xs bg-purple-100 text-purple-700 rounded-full hover:bg-purple-200 transition-colors"
          >
            Today
          </button>
        </div>
        
        <button
          onClick={goToNextMonth}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Week Days Header */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map((day) => (
          <div
            key={day}
            className="text-center text-xs font-medium text-gray-500 py-1"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((date, index) => {
          const isCurrentMonth = isSameMonth(date, currentMonth)
          const isCurrentDay = isToday(date)
          const isSelected = selectedDate && isSameDay(date, selectedDate)
          const taskCount = getTaskCount(date)
          const dateKey = format(date, 'yyyy-MM-dd')
          const dayTasks = tasksByDate[dateKey] || []

          return (
            <motion.button
              key={date.toISOString()}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.01 }}
              onClick={() => handleDateClick(date)}
              className={`
                relative p-2 rounded-lg text-sm font-medium transition-all
                ${isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}
                ${isCurrentDay 
                  ? 'bg-purple-100 text-purple-700 font-semibold' 
                  : isSelected
                    ? 'bg-purple-50 text-purple-600'
                    : 'hover:bg-gray-50'
                }
              `}
            >
              {format(date, 'd')}
              
              {/* Task Indicator */}
              {taskCount > 0 && (
                <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex gap-0.5">
                  {dayTasks.slice(0, 3).map((task, idx) => (
                    <div
                      key={task.id}
                      className={`
                        w-1 h-1 rounded-full
                        ${task.priority === 'high' ? 'bg-red-500' :
                          task.priority === 'medium' ? 'bg-yellow-500' :
                          'bg-green-500'}
                      `}
                    />
                  ))}
                  {taskCount > 3 && (
                    <div className="w-1 h-1 rounded-full bg-gray-400" />
                  )}
                </div>
              )}
            </motion.button>
          )
        })}
      </div>

      {/* Task Summary */}
      {selectedDate && tasksByDate[format(selectedDate, 'yyyy-MM-dd')] && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 pt-4 border-t border-gray-100"
        >
          <div className="text-sm font-medium text-gray-700 mb-2">
            {format(selectedDate, 'EEEE, MMMM d')}
          </div>
          <div className="space-y-1">
            {tasksByDate[format(selectedDate, 'yyyy-MM-dd')].slice(0, 3).map((task) => (
              <div
                key={task.id}
                className="text-xs text-gray-600 truncate flex items-center gap-2"
              >
                <div
                  className={`
                    w-2 h-2 rounded-full flex-shrink-0
                    ${task.priority === 'high' ? 'bg-red-500' :
                      task.priority === 'medium' ? 'bg-yellow-500' :
                      'bg-green-500'}
                  `}
                />
                {task.title}
              </div>
            ))}
            {tasksByDate[format(selectedDate, 'yyyy-MM-dd')].length > 3 && (
              <div className="text-xs text-gray-500">
                +{tasksByDate[format(selectedDate, 'yyyy-MM-dd')].length - 3} more tasks
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  )
}


