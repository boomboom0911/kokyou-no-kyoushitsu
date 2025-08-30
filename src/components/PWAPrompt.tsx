'use client'

import React, { useState, useEffect } from 'react'

export default function PWAPrompt() {
  const [showPrompt, setShowPrompt] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault()
      // Stash the event so it can be triggered later
      setDeferredPrompt(e)
      setShowPrompt(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    // Show the prompt
    deferredPrompt.prompt()

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice
    
    // Clear the saved prompt since it can't be used again
    setDeferredPrompt(null)
    setShowPrompt(false)
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    localStorage.setItem('pwa-prompt-dismissed', 'true')
  }

  // Don't show if user already dismissed or if prompt is not available
  if (!showPrompt || localStorage.getItem('pwa-prompt-dismissed')) {
    return null
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm">
      <div className="bg-gradient-to-r from-teal-500 to-blue-600 text-white p-4 rounded-xl shadow-2xl border border-teal-400">
        <div className="flex items-start gap-3">
          <div className="text-2xl">📱</div>
          <div className="flex-1">
            <div className="font-bold text-sm mb-1">アプリとしてインストール</div>
            <div className="text-xs text-teal-100 mb-3">
              ホーム画面に追加してオフラインでも使用できます
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleInstall}
                className="bg-white text-teal-600 px-3 py-1 rounded-lg text-xs font-medium hover:bg-teal-50 transition-colors"
              >
                インストール
              </button>
              <button
                onClick={handleDismiss}
                className="text-teal-100 hover:text-white px-2 py-1 text-xs transition-colors"
              >
                後で
              </button>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-teal-100 hover:text-white text-lg leading-none"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  )
}