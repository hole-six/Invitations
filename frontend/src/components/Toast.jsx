import React, { useEffect, useState } from 'react'
import { useToast } from '../context/ToastContext'

const Toast = ({ toast }) => {
  const { removeToast } = useToast()
  const [isExiting, setIsExiting] = useState(false)
  const [progress, setProgress] = useState(100)

  const handleClose = () => {
    setIsExiting(true)
    setTimeout(() => {
      removeToast(toast.id)
    }, 300)
  }

  useEffect(() => {
    if (toast.duration > 0) {
      // Progress bar animation
      const interval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev - (100 / (toast.duration / 50))
          return newProgress > 0 ? newProgress : 0
        })
      }, 50)

      // Auto close
      const timer = setTimeout(() => {
        handleClose()
      }, toast.duration)

      return () => {
        clearInterval(interval)
        clearTimeout(timer)
      }
    }
  }, [toast.duration])

  const getConfig = () => {
    switch (toast.type) {
      case 'success':
        return {
          bg: 'bg-white dark:bg-gray-900',
          border: 'border-l-4 border-green-500',
          icon: (
            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          ),
          iconBg: 'bg-green-50 dark:bg-green-900/20',
          title: 'Thành công',
          titleColor: 'text-green-800 dark:text-green-400',
          messageColor: 'text-gray-700 dark:text-gray-300',
          progressBg: 'bg-green-500'
        }
      case 'error':
        return {
          bg: 'bg-white dark:bg-gray-900',
          border: 'border-l-4 border-red-500',
          icon: (
            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ),
          iconBg: 'bg-red-50 dark:bg-red-900/20',
          title: 'Lỗi',
          titleColor: 'text-red-800 dark:text-red-400',
          messageColor: 'text-gray-700 dark:text-gray-300',
          progressBg: 'bg-red-500'
        }
      case 'warning':
        return {
          bg: 'bg-white dark:bg-gray-900',
          border: 'border-l-4 border-yellow-500',
          icon: (
            <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          ),
          iconBg: 'bg-yellow-50 dark:bg-yellow-900/20',
          title: 'Cảnh báo',
          titleColor: 'text-yellow-800 dark:text-yellow-400',
          messageColor: 'text-gray-700 dark:text-gray-300',
          progressBg: 'bg-yellow-500'
        }
      case 'info':
      default:
        return {
          bg: 'bg-white dark:bg-gray-900',
          border: 'border-l-4 border-blue-500',
          icon: (
            <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          iconBg: 'bg-blue-50 dark:bg-blue-900/20',
          title: 'Thông báo',
          titleColor: 'text-blue-800 dark:text-blue-400',
          messageColor: 'text-gray-700 dark:text-gray-300',
          progressBg: 'bg-blue-500'
        }
    }
  }

  const config = getConfig()

  return (
    <div
      className={`
        ${config.bg} ${config.border}
        rounded-lg shadow-lg
        border border-gray-200 dark:border-gray-700
        min-w-[380px] max-w-md
        transition-all duration-300 ease-out
        ${isExiting 
          ? 'opacity-0 translate-x-8 scale-95' 
          : 'opacity-100 translate-x-0 scale-100'
        }
      `}
    >
      {/* Content */}
      <div className="flex items-start gap-3 p-4">
        {/* Icon */}
        <div className={`${config.iconBg} rounded-lg p-2 flex-shrink-0`}>
          {config.icon}
        </div>

        {/* Message */}
        <div className="flex-1 min-w-0 pt-0.5">
          <p className={`text-sm font-semibold ${config.titleColor} mb-0.5`}>
            {config.title}
          </p>
          <p className={`text-sm ${config.messageColor} leading-relaxed`}>
            {toast.message}
          </p>
        </div>

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {/* Progress Bar */}
      {toast.duration > 0 && (
        <div className="h-1 bg-gray-100 dark:bg-gray-800">
          <div
            className={`h-full ${config.progressBg} transition-all duration-50 ease-linear`}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  )
}

const ToastContainer = () => {
  const { toasts } = useToast()

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 pointer-events-none">
      {toasts.map(toast => (
        <div key={toast.id} className="pointer-events-auto">
          <Toast toast={toast} />
        </div>
      ))}
    </div>
  )
}

export default ToastContainer
