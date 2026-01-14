'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useEffect } from 'react'

export default function BottomSheet({ 
  isOpen, 
  onClose, 
  children, 
  title,
  maxHeight = '90vh' 
}) {
  // Prevent body scroll when sheet is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/20 z-40 backdrop-blur-sm"
            onClick={onClose}
          />
          
          {/* Bottom Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ 
              type: 'spring', 
              damping: 25, 
              stiffness: 300,
              duration: 0.3 
            }}
            className="fixed bottom-0 left-0 right-0 z-50"
            style={{ maxHeight }}
          >
            <div className="bg-white rounded-t-2xl shadow-2xl border-t border-gray-100">
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-10 h-1 bg-gray-300 rounded-full" />
              </div>
              
              {/* Header */}
              {title && (
                <div className="px-6 pb-4 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">
                      {title}
                    </h2>
                    <button
                      onClick={onClose}
                      className="p-2 -mr-2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
              
              {/* Content */}
              <div className="px-6 py-4 pb-safe max-h-[70vh] overflow-y-auto">
                {children}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

