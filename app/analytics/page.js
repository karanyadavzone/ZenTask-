'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/lib/auth'
import { taskService } from '@/lib/supabase'
import { format, startOfWeek, endOfWeek, eachDayOfInterval, subWeeks, startOfMonth, endOfMonth } from 'date-fns'
import { useRouter } from 'next/navigation'

export default function AnalyticsPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    inProgressTasks: 0,
    todoTasks: 0,
    completionRate: 0,
    weeklyData: [],
    priorityBreakdown: { high: 0, medium: 0, low: 0 },
    streak: 0
  })
  const [statsLoading, setStatsLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadAnalytics()
    }
  }, [user])

  const loadAnalytics = async () => {
    try {
      setStatsLoading(true)
      const allTasks = await taskService.getAllTasks(user.id)
      
      const completed = allTasks.filter(t => t.status === 'completed')
      const inProgress = allTasks.filter(t => t.status === 'in_progress')
      const todo = allTasks.filter(t => t.status === 'todo')
      
      // Calculate completion rate
      const completionRate = allTasks.length > 0 
        ? Math.round((completed.length / allTasks.length) * 100) 
        : 0

      // Weekly completion data (last 7 weeks)
      const weeklyData = []
      for (let i = 6; i >= 0; i--) {
        const weekStart = startOfWeek(subWeeks(new Date(), i))
        const weekEnd = endOfWeek(subWeeks(new Date(), i))
        const weekTasks = allTasks.filter(task => {
          if (!task.completed_at) return false
          const completedDate = new Date(task.completed_at)
          return completedDate >= weekStart && completedDate <= weekEnd
        })
        weeklyData.push({
          week: format(weekStart, 'MMM d'),
          completed: weekTasks.length
        })
      }

      // Priority breakdown
      const priorityBreakdown = {
        high: allTasks.filter(t => t.priority === 'high').length,
        medium: allTasks.filter(t => t.priority === 'medium').length,
        low: allTasks.filter(t => t.priority === 'low').length
      }

      // Calculate streak (consecutive days with completed tasks)
      let streak = 0
      const today = new Date()
      for (let i = 0; i < 30; i++) {
        const checkDate = new Date(today)
        checkDate.setDate(today.getDate() - i)
        const dateStr = format(checkDate, 'yyyy-MM-dd')
        const hasCompleted = completed.some(task => {
          if (!task.completed_at) return false
          return format(new Date(task.completed_at), 'yyyy-MM-dd') === dateStr
        })
        if (hasCompleted) {
          streak++
        } else if (i > 0) {
          break
        }
      }

      setStats({
        totalTasks: allTasks.length,
        completedTasks: completed.length,
        inProgressTasks: inProgress.length,
        todoTasks: todo.length,
        completionRate,
        weeklyData,
        priorityBreakdown,
        streak
      })
    } catch (error) {
      console.error('Error loading analytics:', error)
    } finally {
      setStatsLoading(false)
    }
  }

  const maxWeeklyCompleted = Math.max(...stats.weeklyData.map(d => d.completed), 1)

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-b-3xl p-6 text-white mb-6">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => router.push('/profile')}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-2xl font-bold">Analytics</h1>
          <div className="w-9" />
        </div>
        <p className="text-white/80">Your productivity insights</p>
      </div>

      <div className="px-6 pb-20 space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
          >
            <div className="text-sm text-gray-600 mb-1">Completion Rate</div>
            <div className="text-3xl font-bold text-purple-600">{stats.completionRate}%</div>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${stats.completionRate}%` }}
                transition={{ duration: 1, delay: 0.2 }}
                className="bg-purple-600 h-2 rounded-full"
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
          >
            <div className="text-sm text-gray-600 mb-1">Streak</div>
            <div className="text-3xl font-bold text-emerald-600">{stats.streak} days</div>
            <div className="text-xs text-gray-500 mt-1">🔥 Keep it up!</div>
          </motion.div>
        </div>

        {/* Task Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Task Breakdown</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Completed</span>
                <span className="font-medium">{stats.completedTasks}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(stats.completedTasks / Math.max(stats.totalTasks, 1)) * 100}%` }}
                  transition={{ duration: 1, delay: 0.3 }}
                  className="bg-emerald-600 h-2 rounded-full"
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">In Progress</span>
                <span className="font-medium">{stats.inProgressTasks}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(stats.inProgressTasks / Math.max(stats.totalTasks, 1)) * 100}%` }}
                  transition={{ duration: 1, delay: 0.4 }}
                  className="bg-blue-600 h-2 rounded-full"
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">To Do</span>
                <span className="font-medium">{stats.todoTasks}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(stats.todoTasks / Math.max(stats.totalTasks, 1)) * 100}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="bg-gray-400 h-2 rounded-full"
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Weekly Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Weekly Progress</h2>
          <div className="flex items-end justify-between gap-2 h-32">
            {stats.weeklyData.map((week, index) => {
              const height = (week.completed / maxWeeklyCompleted) * 100
              return (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div className="w-full flex flex-col items-center justify-end h-24 mb-2">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${height}%` }}
                      transition={{ duration: 0.8, delay: 0.4 + index * 0.1 }}
                      className={`w-full rounded-t-lg ${
                        week.completed > 0 ? 'bg-gradient-to-t from-purple-600 to-blue-500' : 'bg-gray-200'
                      }`}
                    />
                  </div>
                  <div className="text-xs text-gray-500 text-center">{week.week}</div>
                  <div className="text-xs font-medium text-gray-700 mt-1">{week.completed}</div>
                </div>
              )
            })}
          </div>
        </motion.div>

        {/* Priority Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Priority Distribution</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">High Priority</span>
                <span className="font-medium text-red-600">{stats.priorityBreakdown.high}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(stats.priorityBreakdown.high / Math.max(stats.totalTasks, 1)) * 100}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="bg-red-600 h-2 rounded-full"
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Medium Priority</span>
                <span className="font-medium text-yellow-600">{stats.priorityBreakdown.medium}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(stats.priorityBreakdown.medium / Math.max(stats.totalTasks, 1)) * 100}%` }}
                  transition={{ duration: 1, delay: 0.6 }}
                  className="bg-yellow-600 h-2 rounded-full"
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Low Priority</span>
                <span className="font-medium text-green-600">{stats.priorityBreakdown.low}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(stats.priorityBreakdown.low / Math.max(stats.totalTasks, 1)) * 100}%` }}
                  transition={{ duration: 1, delay: 0.7 }}
                  className="bg-green-600 h-2 rounded-full"
                />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}


