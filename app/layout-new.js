import './globals.css'
import { Inter } from 'next/font/google'
import BottomNav from '@/components/layout/BottomNav'
import { AuthProvider } from '@/lib/auth'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata = {
  title: 'Task Reminder - Your Calm Productivity Companion',
  description: 'A beautiful, minimal task management app designed for focus and peace of mind.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Task Reminder',
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#7c3aed',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Task Reminder" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.svg" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="shortcut icon" href="/favicon.svg" />
      </head>
      <body className="font-sans bg-gradient-to-br from-slate-50 to-blue-50 text-gray-900 antialiased">
        <AuthProvider>
          <div className="min-h-screen pb-20">
            <main className="max-w-md mx-auto">
              {children}
            </main>
            <BottomNav />
          </div>
        </AuthProvider>
      </body>
    </html>
  )
}

