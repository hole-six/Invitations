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
    }, 400)
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
          gradient: 'from-emerald-500 to-teal-500',
          bgGradient: 'from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30',
          borderColor: 'border-emerald-200 dark:border-emerald-800',
          iconBg: 'bg-gradient-to-br from-emerald-500 to-teal-500',
          icon: 'check_circle',
          textColor: 'text-emerald-900 dark:text-emerald-100',
          progressBg: 'bg-gradient-to-r from-emerald-500 to-teal-500'
        }
      case 'error':
        return {
          gradient: 'from-rose-500 to-pink-500',
          bgGradient: 'from-rose-50 to-pink-50 dark:from-rose-950/30 dark:to-pink-950/30',
          borderColor: 'border-rose-200 dark:border-rose-800',
          iconBg: 'bg-gradient-to-br from-rose-500 to-pink-500',
          icon: 'cancel',
          textColor: 'text-rose-900 dark:text-rose-100',
          progressBg: 'bg-gradient-to-r from-rose-500 to-pink-500'
        }
      case 'warning':
        return {
          gradient: 'from-amber-500 to-orange-500',
          bgGradient: 'from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30',
          borderColor: 'border-amber-200 dark:border-amber-800',
          iconBg: 'bg-gradient-to-br from-amber-500 to-orange-500',
          icon: 'warning',
          textColor: 'text-amber-900 dark:text-amber-100',
          progressBg: 'bg-gradient-to-r from-amber-500 to-orange-500'
        }
      case 'info':
      default:
        return {
          gradient: 'from-blue-500 to-indigo-500',
          bgGradient: 'from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30',
          borderColor: 'border-blue-200 dark:border-blue-800',
          iconBg: 'bg-gradient-to-br from-blue-500 to-indigo-500',
          icon: 'info',
          textColor: 'text-blue-900 dark:text-blue-100',
          progressBg: 'bg-gradient-to-r from-blue-500 to-indigo-500'
        }
    }
  }

  const config = getConfig()

  return (
    <div
      className={`
        relative overflow-hidden rounded-2xl shadow-2xl
        bg-gradient-to-br ${config.bgGradient}
        border-2 ${config.borderColor}
        backdrop-blur-xl
        min-w-[380px] max-w-md
        transition-all duration-400 ease-out
        ${isExiting 
          ? 'opacity-0 translate-x-full scale-90' 
          : 'opacity-100 translate-x-0 scale-100 animate-toast-in'
        }
      `}
      style={{
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
      }}
    >
      {/* Decorative gradient overlay */}
      <div className={`absolute inset-0 bg-gradient-to-br ${config.gradient} opacity-5`}></div>
      
      {/* Content */}
      <div className="relative flex items-start gap-4 p-5">
        {/* Icon with glow effect */}
        <div className="relative shrink-0">
          <div className={`absolute inset-0 ${config.iconBg} blur-xl opacity-40 animate-pulse`}></div>
          <div className={`relative w-12 h-12 rounded-xl ${config.iconBg} flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform`}>
            <span className="material-symbols-outlined text-white text-2xl font-bold">
              {config.icon}
            </span>
          </div>
        </div>

        {/* Message */}
        <div className="flex-1 min-w-0 pt-1">
          <p className={`text-sm font-semibold leading-relaxed ${config.textColor}`}>
            {toast.message}
          </p>
        </div>

        {/* Close Button */}
        <button
          onClick={handleClose}
          className={`
            shrink-0 w-8 h-8 rounded-lg
            flex items-center justify-center
            hover:bg-white/50 dark:hover:bg-black/20
            transition-all duration-200
            group
          `}
        >
          <span className="material-symbols-outlined text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200 text-lg">
            close
          </span>
        </button>
      </div>

      {/* Progress Bar */}
      {toast.duration > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/5 dark:bg-white/5">
          <div
            className={`h-full ${config.progressBg} transition-all duration-50 ease-linear shadow-lg`}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Decorative corner accents */}
      <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${config.gradient} opacity-10 blur-2xl`}></div>
      <div className={`absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr ${config.gradient} opacity-10 blur-2xl`}></div>
    </div>
  )
}

const ToastContainer = () => {
  const { toasts } = useToast()

  return (
    <div className="fixed top-20 right-6 z-[9999] flex flex-col gap-4 pointer-events-none">
      {toasts.map(toast => (
        <div key={toast.id} className="pointer-events-auto">
          <Toast toast={toast} />
        </div>
      ))}
    </div>
  )
}

export default ToastContainer
