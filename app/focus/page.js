'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/lib/auth'
import { taskService } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'

export default function FocusPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [currentTask, setCurrentTask] = useState(null)
  const [tasks, setTasks] = useState([])
  const [isFocusing, setIsFocusing] = useState(false)
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [timerRunning, setTimerRunning] = useState(false)
  const [pomodoroMinutes, setPomodoroMinutes] = useState(25)

  useEffect(() => {
    if (user) {
      loadFocusTasks()
    }
  }, [user])

  useEffect(() => {
    let interval = null
    if (timerRunning && isFocusing) {
      interval = setInterval(() => {
        setTimeElapsed(prev => {
          const newTime = prev + 1
          // Auto-complete after pomodoro time (in seconds)
          if (newTime >= pomodoroMinutes * 60) {
            handleComplete()
            return 0
          }
          return newTime
        })
      }, 1000)
    } else {
      clearInterval(interval)
    }
    return () => clearInterval(interval)
  }, [timerRunning, isFocusing, pomodoroMinutes])

  const loadFocusTasks = async () => {
    try {
      const allTasks = await taskService.getAllTasks(user.id)
      const activeTasks = allTasks.filter(
        task => task.status !== 'completed' && !task.deleted
      )
      setTasks(activeTasks)
      
      // Auto-select first task if available
      if (activeTasks.length > 0 && !currentTask) {
        setCurrentTask(activeTasks[0])
      }
    } catch (error) {
      console.error('Error loading tasks:', error)
    }
  }

  const handleStartFocus = () => {
    if (!currentTask) return
    setIsFocusing(true)
    setTimerRunning(true)
    setTimeElapsed(0)
  }

  const handlePause = () => {
    setTimerRunning(false)
  }

  const handleResume = () => {
    setTimerRunning(true)
  }

  const handleStop = () => {
    setIsFocusing(false)
    setTimerRunning(false)
    setTimeElapsed(0)
  }

  const handleComplete = async () => {
    if (!currentTask) return
    
    try {
      await taskService.updateTask(currentTask.id, {
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      
      // Move to next task
      const remainingTasks = tasks.filter(t => t.id !== currentTask.id)
      if (remainingTasks.length > 0) {
        setCurrentTask(remainingTasks[0])
        setTasks(remainingTasks)
      } else {
        setCurrentTask(null)
        setTasks([])
      }
      
      handleStop()
      loadFocusTasks()
    } catch (error) {
      console.error('Error completing task:', error)
    }
  }

  const handleSkip = () => {
    const currentIndex = tasks.findIndex(t => t.id === currentTask?.id)
    const nextIndex = (currentIndex + 1) % tasks.length
    setCurrentTask(tasks[nextIndex] || null)
    handleStop()
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const progress = (timeElapsed / (pomodoroMinutes * 60)) * 100

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-6 bg-gray-900 text-white">
        <h1 className="text-xl font-semibold mb-4">Please sign in</h1>
        <a href="/auth/login" className="btn-primary">Sign In</a>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white">
      {/* Header */}
      <div className="flex items-center justify-between p-6">
        <button
          onClick={() => router.push('/')}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-xl font-semibold">Focus Mode</h1>
        <div className="w-9" />
      </div>

      {/* Main Content */}
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] px-6">
        {!currentTask ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-2">All tasks completed!</h2>
            <p className="text-white/60 mb-6">Great work. Take a break or add more tasks.</p>
            <button
              onClick={() => router.push('/')}
              className="px-6 py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors"
            >
              Go to Home
            </button>
          </motion.div>
        ) : (
          <>
            {/* Timer Circle */}
            <div className="relative mb-12">
              <svg className="transform -rotate-90 w-64 h-64">
                <circle
                  cx="128"
                  cy="128"
                  r="120"
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="8"
                  fill="none"
                />
                <motion.circle
                  cx="128"
                  cy="128"
                  r="120"
                  stroke="url(#gradient)"
                  strokeWidth="8"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 120}`}
                  strokeDashoffset={`${2 * Math.PI * 120 * (1 - progress / 100)}`}
                  initial={{ strokeDashoffset: 2 * Math.PI * 120 }}
                  animate={{ strokeDashoffset: 2 * Math.PI * 120 * (1 - progress / 100) }}
                  transition={{ duration: 1 }}
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#a855f7" />
                    <stop offset="100%" stopColor="#3b82f6" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-5xl font-bold mb-2">
                  {formatTime(pomodoroMinutes * 60 - timeElapsed)}
                </div>
                <div className="text-white/60 text-sm">
                  {isFocusing ? (timerRunning ? 'Focusing...' : 'Paused') : 'Ready to focus'}
                </div>
              </div>
            </div>

            {/* Current Task */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full max-w-md mb-8"
            >
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold mb-2">{currentTask.title}</h2>
                    {currentTask.description && (
                      <p className="text-white/70 text-sm">{currentTask.description}</p>
                    )}
                  </div>
                  <button
                    onClick={handleSkip}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    title="Skip to next task"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>

                {/* Task Info */}
                <div className="flex items-center gap-4 text-sm text-white/60">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    currentTask.priority === 'high' ? 'bg-red-500/20 text-red-300' :
                    currentTask.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-300' :
                    'bg-green-500/20 text-green-300'
                  }`}>
                    {currentTask.priority}
                  </span>
                  {currentTask.due_date && (
                    <span>{format(new Date(currentTask.due_date), 'MMM d')}</span>
                  )}
                  <span>{tasks.length} tasks remaining</span>
                </div>
              </div>
            </motion.div>

            {/* Controls */}
            <div className="flex items-center gap-4">
              {!isFocusing ? (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleStartFocus}
                  className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all"
                >
                  Start Focus
                </motion.button>
              ) : (
                <>
                  {timerRunning ? (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handlePause}
                      className="px-6 py-3 bg-yellow-600 text-white rounded-xl font-medium hover:bg-yellow-700 transition-colors"
                    >
                      Pause
                    </motion.button>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleResume}
                      className="px-6 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors"
                    >
                      Resume
                    </motion.button>
                  )}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleComplete}
                    className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors"
                  >
                    Complete
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleStop}
                    className="px-6 py-3 bg-gray-700 text-white rounded-xl font-medium hover:bg-gray-600 transition-colors"
                  >
                    Stop
                  </motion.button>
                </>
              )}
            </div>

            {/* Pomodoro Settings */}
            <div className="mt-8 flex items-center gap-4">
              <span className="text-white/60 text-sm">Pomodoro:</span>
              {[15, 25, 45].map((mins) => (
                <button
                  key={mins}
                  onClick={() => {
                    setPomodoroMinutes(mins)
                    setTimeElapsed(0)
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    pomodoroMinutes === mins
                      ? 'bg-purple-600 text-white'
                      : 'bg-white/10 text-white/70 hover:bg-white/20'
                  }`}
                >
                  {mins}m
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}


