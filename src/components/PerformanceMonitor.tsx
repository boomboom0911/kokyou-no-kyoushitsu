'use client'

import React, { useState, useEffect } from 'react'

export default function PerformanceMonitor() {
  const [metrics, setMetrics] = useState({
    loadTime: 0,
    memoryUsage: 0,
    fps: 0,
    networkStatus: 'online'
  })
  const [showMonitor, setShowMonitor] = useState(false)

  useEffect(() => {
    // ページロード時間を測定
    const loadTime = performance.now()
    setMetrics(prev => ({ ...prev, loadTime }))

    // メモリ使用量を監視（対応ブラウザのみ）
    const updateMemory = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory
        const usedMB = Math.round(memory.usedJSHeapSize / 1048576)
        setMetrics(prev => ({ ...prev, memoryUsage: usedMB }))
      }
    }

    // FPS監視
    let frameCount = 0
    let lastTime = performance.now()
    
    const measureFPS = () => {
      frameCount++
      const currentTime = performance.now()
      if (currentTime - lastTime >= 1000) {
        setMetrics(prev => ({ ...prev, fps: frameCount }))
        frameCount = 0
        lastTime = currentTime
      }
      requestAnimationFrame(measureFPS)
    }

    // ネットワーク状態監視
    const updateNetworkStatus = () => {
      setMetrics(prev => ({ 
        ...prev, 
        networkStatus: navigator.onLine ? 'online' : 'offline' 
      }))
    }

    window.addEventListener('online', updateNetworkStatus)
    window.addEventListener('offline', updateNetworkStatus)

    const memoryInterval = setInterval(updateMemory, 2000)
    measureFPS()

    return () => {
      clearInterval(memoryInterval)
      window.removeEventListener('online', updateNetworkStatus)
      window.removeEventListener('offline', updateNetworkStatus)
    }
  }, [])

  if (!showMonitor) {
    return (
      <button
        onClick={() => setShowMonitor(true)}
        className="fixed bottom-4 right-4 bg-gray-800 text-white p-2 rounded-full shadow-lg z-40 hover:bg-gray-700 transition-colors"
        title="パフォーマンス監視"
      >
        📊
      </button>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white border-2 border-gray-200 rounded-xl shadow-2xl p-4 z-40 min-w-[200px]">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-sm text-gray-800">📊 パフォーマンス</h3>
        <button
          onClick={() => setShowMonitor(false)}
          className="text-gray-500 hover:text-gray-700 text-sm"
        >
          ✕
        </button>
      </div>

      <div className="space-y-2 text-xs">
        <div className="flex justify-between">
          <span className="text-gray-600">ロード時間:</span>
          <span className="font-mono text-green-600">
            {Math.round(metrics.loadTime)}ms
          </span>
        </div>

        {metrics.memoryUsage > 0 && (
          <div className="flex justify-between">
            <span className="text-gray-600">メモリ使用量:</span>
            <span className={`font-mono ${metrics.memoryUsage > 100 ? 'text-red-600' : 'text-green-600'}`}>
              {metrics.memoryUsage}MB
            </span>
          </div>
        )}

        <div className="flex justify-between">
          <span className="text-gray-600">FPS:</span>
          <span className={`font-mono ${metrics.fps < 30 ? 'text-red-600' : metrics.fps < 50 ? 'text-yellow-600' : 'text-green-600'}`}>
            {metrics.fps}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-600">ネットワーク:</span>
          <span className={`font-mono ${metrics.networkStatus === 'online' ? 'text-green-600' : 'text-red-600'}`}>
            {metrics.networkStatus === 'online' ? '🟢 オンライン' : '🔴 オフライン'}
          </span>
        </div>
      </div>

      <div className="mt-3 pt-2 border-t border-gray-200">
        <div className="text-xs text-gray-500">
          {metrics.loadTime < 1000 && metrics.fps > 50 && (
            <div className="text-green-600 font-semibold">⚡ 最適化済み</div>
          )}
          {metrics.loadTime > 3000 && (
            <div className="text-red-600">⚠️ 読み込み遅延</div>
          )}
          {metrics.fps < 30 && (
            <div className="text-red-600">⚠️ FPS低下</div>
          )}
          {metrics.memoryUsage > 100 && (
            <div className="text-yellow-600">⚠️ メモリ使用量多</div>
          )}
        </div>
      </div>
    </div>
  )
}