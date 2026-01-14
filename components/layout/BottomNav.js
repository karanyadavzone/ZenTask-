'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'

const navItems = [
  {
    href: '/',
    label: 'Home',
    icon: (active) => (
      <svg className={`w-5 h-5 ${active ? 'text-purple-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 2.5 : 2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    )
  },
  {
    href: '/calendar',
    label: 'Calendar',
    icon: (active) => (
      <svg className={`w-5 h-5 ${active ? 'text-purple-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 2.5 : 2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    )
  },
  {
    href: '/completed',
    label: 'Done',
    icon: (active) => (
      <svg className={`w-5 h-5 ${active ? 'text-purple-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 2.5 : 2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  },
  {
    href: '/profile',
    label: 'Profile',
    icon: (active) => (
      <svg className={`w-5 h-5 ${active ? 'text-purple-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 2.5 : 2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    )
  }
]

export default function BottomNav() {
  const pathname = usePathname()

  // Don't show nav on auth pages
  if (pathname?.startsWith('/auth')) {
    return null
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-gray-100 pb-safe">
      <div className="flex items-center justify-around px-2 py-1 max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative flex flex-col items-center justify-center p-2 min-w-0 flex-1 touch-manipulation"
            >
              {/* Active indicator */}
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg"
                  initial={false}
                  transition={{ type: 'spring', duration: 0.3 }}
                />
              )}
              
              {/* Icon and label */}
              <div className="relative flex flex-col items-center gap-0.5">
                {item.icon(isActive)}
                <span className={`text-xs font-medium leading-tight ${
                  isActive ? 'text-purple-600' : 'text-gray-500'
                }`}>
                  {item.label}
                </span>
              </div>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
