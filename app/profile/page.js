'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/lib/auth'
import { taskService } from '@/lib/supabase'
import TrashView from '@/components/features/TrashView'
import TagManager from '@/components/features/TagManager'
import BottomSheet from '@/components/ui/BottomSheet'

export default function ProfilePage() {
  const { user, loading, signOut } = useAuth()
  const [activeTab, setActiveTab] = useState('stats')
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    todayTasks: 0,
    upcomingTasks: 0
  })
  const [statsLoading, setStatsLoading] = useState(true)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showTheme, setShowTheme] = useState(false)
  const [theme, setTheme] = useState('light')

  useEffect(() => {
    if (user) {
      loadStats()
      // Load theme preference
      const savedTheme = localStorage.getItem('theme') || 'light'
      setTheme(savedTheme)
    }
  }, [user])

  const loadStats = async () => {
    try {
      setStatsLoading(true)
      const allTasks = await taskService.getAllTasks(user.id)
      const todayTasks = await taskService.getTodaysTasks(user.id)
      const upcomingTasks = await taskService.getUpcomingTasks(user.id)
      
      const completed = allTasks.filter(task => task.status === 'completed')
      
      setStats({
        totalTasks: allTasks.length,
        completedTasks: completed.length,
        todayTasks: todayTasks.length,
        upcomingTasks: upcomingTasks.length
      })
    } catch (error) {
      console.error('Error loading stats:', error)
    } finally {
      setStatsLoading(false)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      window.location.href = '/auth/login'
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    // Apply theme to document
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    setShowTheme(false)
  }

  const tabs = [
    { id: 'stats', label: 'Stats', icon: '📊' },
    { id: 'trash', label: 'Trash', icon: '🗑️' },
    { id: 'tags', label: 'Tags', icon: '🏷️' },
    { id: 'settings', label: 'Settings', icon: '⚙️' }
  ]

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
      <div className="bg-gradient-to-r from-slate-600 to-purple-600 rounded-b-3xl p-6 text-white mb-6">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
            <span className="text-2xl font-bold">
              {user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
            </span>
          </div>
          <div>
            <h1 className="text-2xl font-bold">
              {user?.user_metadata?.full_name || 'User'}
            </h1>
            <p className="text-white/80">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6 mb-6">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all
                ${activeTab === tab.id
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
                }
              `}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="px-6 pb-20">
        <AnimatePresence mode="wait">
          {activeTab === 'stats' && (
            <motion.div
              key="stats"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Progress</h2>
              
              {statsLoading ? (
                <div className="grid grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="bg-white rounded-2xl p-4 animate-pulse shadow-sm">
                      <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                      <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
                  >
                    <div className="text-sm text-gray-600 mb-1">Total Tasks</div>
                    <div className="text-2xl font-bold text-gray-900">{stats.totalTasks}</div>
                  </motion.div>

                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
                  >
                    <div className="text-sm text-gray-600 mb-1">Completed</div>
                    <div className="text-2xl font-bold text-emerald-600">{stats.completedTasks}</div>
                  </motion.div>

                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
                  >
                    <div className="text-sm text-gray-600 mb-1">Today</div>
                    <div className="text-2xl font-bold text-blue-600">{stats.todayTasks}</div>
                  </motion.div>

                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
                  >
                    <div className="text-sm text-gray-600 mb-1">Upcoming</div>
                    <div className="text-2xl font-bold text-purple-600">{stats.upcomingTasks}</div>
                  </motion.div>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'trash' && (
            <motion.div
              key="trash"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <TrashView />
            </motion.div>
          )}

          {activeTab === 'tags' && (
            <motion.div
              key="tags"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <TagManager />
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Settings</h2>
              
              <div className="space-y-3">
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowNotifications(true)}
                  className="w-full bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4 4h7l5 5v5" />
                      </svg>
                    </div>
                    <div className="text-left">
                      <div className="font-medium text-gray-900">Notifications</div>
                      <div className="text-sm text-gray-500">Manage your alerts</div>
                    </div>
                  </div>
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </motion.button>

                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowTheme(true)}
                  className="w-full bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
                      </svg>
                    </div>
                    <div className="text-left">
                      <div className="font-medium text-gray-900">Theme</div>
                      <div className="text-sm text-gray-500 capitalize">{theme} mode</div>
                    </div>
                  </div>
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </motion.button>

                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSignOut}
                  className="w-full bg-white rounded-2xl p-4 shadow-sm border border-red-200 flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                      <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                    </div>
                    <div className="text-left">
                      <div className="font-medium text-red-600">Sign Out</div>
                      <div className="text-sm text-red-400">Log out of your account</div>
                    </div>
                  </div>
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Theme Selection Bottom Sheet */}
      <BottomSheet
        isOpen={showTheme}
        onClose={() => setShowTheme(false)}
        title="Choose Theme"
      >
        <div className="space-y-3">
          {['light', 'dark', 'system'].map((themeOption) => (
            <button
              key={themeOption}
              onClick={() => handleThemeChange(themeOption)}
              className={`w-full p-4 rounded-xl text-left transition-colors ${
                theme === themeOption
                  ? 'bg-purple-100 text-purple-700 border-2 border-purple-600'
                  : 'bg-gray-50 text-gray-700 border-2 border-transparent hover:bg-gray-100'
              }`}
            >
              <div className="font-medium capitalize">{themeOption}</div>
              <div className="text-sm text-gray-500 mt-1">
                {themeOption === 'system' ? 'Follow system preference' : `${themeOption} mode`}
              </div>
            </button>
          ))}
        </div>
      </BottomSheet>

      {/* Notifications Bottom Sheet */}
      <BottomSheet
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
        title="Notification Settings"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Browser notifications will be implemented in a future update. For now, you can enable notifications in your browser settings.
          </p>
          <div className="p-4 bg-blue-50 rounded-xl">
            <p className="text-sm text-blue-800">
              <strong>Coming soon:</strong> Task reminders, due date notifications, and daily summaries.
            </p>
          </div>
        </div>
      </BottomSheet>
    </div>
  )
}
