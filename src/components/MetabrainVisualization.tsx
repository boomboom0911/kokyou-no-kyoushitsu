'use client'

import React, { useEffect, useRef, useState } from 'react'
import { Network } from 'vis-network'
import { DataSet } from 'vis-data'
import { MetabrainNode, MetabrainEdge, MetabrainVisualizationData, calculateEdgeAnimation } from '@/lib/metabrain-api'

interface MetabrainVisualizationProps {
  data: MetabrainVisualizationData
  onNodeSelect?: (node: MetabrainNode | null) => void
  className?: string
}

export default function MetabrainVisualization({ 
  data, 
  onNodeSelect,
  className = '' 
}: MetabrainVisualizationProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const networkRef = useRef<Network | null>(null)
  const [selectedNode, setSelectedNode] = useState<MetabrainNode | null>(null)
  const [hoveredEdge, setHoveredEdge] = useState<MetabrainEdge | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    // vis.jsのデータセット作成
    const nodes = new DataSet(data.nodes.map(node => ({
      id: node.id,
      label: node.label,
      title: node.title,
      color: {
        background: node.color,
        border: node.type === 'own' ? '#ffb74d' : '#ffffff',
        borderWidth: node.type === 'own' ? 3 : 1,
        shadow: {
          enabled: true,
          color: node.color,
          size: node.type === 'own' ? 15 : 8,
          x: 0,
          y: 0
        }
      },
      size: node.size,
      font: {
        color: node.type === 'own' ? '#000000' : '#ffffff',
        size: node.type === 'own' ? 14 : 12,
        face: 'Noto Sans JP, sans-serif',
        strokeWidth: 2,
        strokeColor: node.type === 'own' ? '#ffffff' : '#000000'
      },
      physics: {
        mass: node.type === 'own' ? 3 : 1
      }
    })))

    const edges = new DataSet(data.edges.map(edge => {
      const animationStyle = calculateEdgeAnimation(edge);
      
      return {
        id: edge.id,
        from: edge.from,
        to: edge.to,
        width: edge.width,
        color: {
          color: edge.color,
          opacity: Math.min(0.9, 0.4 + (edge.strength || 1) * 0.1),
          hover: edge.color,
          highlight: '#ffffff'
        },
        smooth: {
          enabled: true,
          type: edge.strength && edge.strength >= 3 ? 'dynamic' : 'curvedCW',
          roundness: Math.min(0.5, 0.1 + (edge.strength || 1) * 0.05)
        },
        label: edge.label,
        font: {
          color: '#ffffff',
          size: Math.min(14, 8 + (edge.strength || 1)),
          strokeWidth: 2,
          strokeColor: '#000000'
        },
        arrows: {
          to: false
        },
        // 動的アニメーション適用
        ...animationStyle,
        // 強度による追加効果
        chosen: {
          edge: function(values: any, id: string) {
            values.width = edge.width * 1.5;
            values.color = '#ffffff';
          }
        }
      };
    }));

    // 宇宙テーマのネットワーク設定
    const options = {
      physics: {
        enabled: true,
        solver: 'forceAtlas2Based',
        forceAtlas2Based: {
          theta: 0.5,
          gravitationalConstant: -50,
          centralGravity: 0.01,
          springConstant: 0.08,
          springLength: 100,
          damping: 0.4,
          avoidOverlap: 1
        },
        maxVelocity: 20,
        minVelocity: 0.1,
        stabilization: {
          enabled: true,
          iterations: 200,
          updateInterval: 25
        }
      },
      layout: {
        improvedLayout: true
      },
      interaction: {
        hover: true,
        hoverConnectedEdges: true,
        selectConnectedEdges: false,
        tooltipDelay: 300
      },
      nodes: {
        borderWidth: 2,
        borderWidthSelected: 3,
        chosen: {
          node: function(values: any, id: string) {
            values.shadow = true
            values.shadowSize = 20
            values.shadowColor = '#64b5f6'
          }
        }
      },
      edges: {
        selectionWidth: 3,
        chosen: {
          edge: function(values: any, id: string) {
            values.color = '#ffffff'
            values.width = values.width * 1.5
          }
        }
      }
    }

    // ネットワーク初期化
    const network = new Network(containerRef.current, { nodes, edges }, options)
    networkRef.current = network

    // ノード選択イベント
    network.on('selectNode', (params) => {
      if (params.nodes.length > 0) {
        const nodeId = params.nodes[0]
        const selectedNodeData = data.nodes.find(n => n.id === nodeId)
        if (selectedNodeData) {
          setSelectedNode(selectedNodeData)
          onNodeSelect?.(selectedNodeData)
        }
      }
    })

    network.on('deselectNode', () => {
      setSelectedNode(null)
      onNodeSelect?.(null)
    })

    // ホバーエフェクト
    network.on('hoverNode', () => {
      containerRef.current!.style.cursor = 'pointer'
    })

    network.on('blurNode', () => {
      containerRef.current!.style.cursor = 'default'
    })

    // エッジホバーエフェクト
    network.on('hoverEdge', (params) => {
      if (params.edge) {
        const edgeData = data.edges.find(e => e.id === params.edge)
        if (edgeData) {
          setHoveredEdge(edgeData)
        }
      }
      containerRef.current!.style.cursor = 'pointer'
    })

    network.on('blurEdge', () => {
      setHoveredEdge(null)
      containerRef.current!.style.cursor = 'default'
    })

    // 初期カメラ位置設定（少し引いた視点）
    setTimeout(() => {
      network.fit({
        animation: {
          duration: 1000,
          easingFunction: 'easeInOutQuad'
        }
      })
    }, 500)

    // クリーンアップ
    return () => {
      if (networkRef.current) {
        networkRef.current.destroy()
        networkRef.current = null
      }
    }
  }, [data, onNodeSelect])

  return (
    <div className={`relative ${className}`}>
      {/* 宇宙背景エフェクト */}
      <div className="absolute inset-0 overflow-hidden rounded-lg">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950">
          {/* 星屑エフェクト */}
          <div className="absolute inset-0">
            {Array.from({ length: 50 }, (_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-white rounded-full opacity-70 animate-pulse"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                  animationDuration: `${2 + Math.random() * 4}s`
                }}
              />
            ))}
          </div>
          
          {/* 遠い銀河の光 */}
          <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-blue-500 rounded-full opacity-10 blur-3xl animate-pulse" />
          <div className="absolute bottom-1/3 right-1/4 w-24 h-24 bg-blue-400 rounded-full opacity-20 blur-3xl animate-pulse" style={{animationDelay: '1.5s'}} />
        </div>
      </div>

      {/* ネットワーク可視化 */}
      <div 
        ref={containerRef} 
        className="relative w-full h-full rounded-lg"
        style={{ minHeight: '500px' }}
      />

      {/* 浮遊するUI要素 */}
      {selectedNode && (
        <div className="absolute top-4 left-4 bg-slate-800/90 backdrop-blur-sm text-white p-4 rounded-lg border border-blue-400/30 shadow-lg shadow-blue-500/20 max-w-xs">
          <div className="text-sm opacity-75 mb-1">
            {selectedNode.type === 'own' && '🌟 自分のトピック'}
            {selectedNode.type === 'liked' && '💎 いいねしたトピック'}
            {selectedNode.type === 'commented' && '🔮 コメントしたトピック'}
            {selectedNode.type === 'viewed' && '⚪ 閲覧したトピック'}
          </div>
          <div className="font-medium mb-2">{selectedNode.label}</div>
          {selectedNode.className && selectedNode.date && (
            <div className="text-xs opacity-60">
              {selectedNode.className} • {selectedNode.date}
            </div>
          )}
        </div>
      )}

      {/* つながりの詳細情報 */}
      {hoveredEdge && (
        <div className="absolute top-4 right-4 bg-slate-800/90 backdrop-blur-sm text-white p-4 rounded-lg border border-yellow-400/30 shadow-lg shadow-yellow-500/20 max-w-xs">
          <div className="text-sm opacity-75 mb-1">
            🔗 つながりの強さ
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>強度:</span>
              <div className="flex items-center gap-1">
                <div className="w-16 h-2 bg-gray-600 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-400 to-yellow-400 rounded-full"
                    style={{ width: `${Math.min(100, (hoveredEdge.strength || 1) * 20)}%` }}
                  />
                </div>
                <span className="font-mono text-xs">
                  {hoveredEdge.strength?.toFixed(1) || '1.0'}
                </span>
              </div>
            </div>
            <div className="flex justify-between">
              <span>太さ:</span>
              <span className="font-mono text-xs">{hoveredEdge.width}px</span>
            </div>
            {hoveredEdge.viewingFrequency && (
              <div className="flex justify-between">
                <span>閲覧:</span>
                <span className="font-mono text-xs">{hoveredEdge.viewingFrequency}回</span>
              </div>
            )}
            {hoveredEdge.interactionCount && (
              <div className="flex justify-between">
                <span>関与:</span>
                <span className="font-mono text-xs">{hoveredEdge.interactionCount}回</span>
              </div>
            )}
          </div>
          <div className="text-xs opacity-60 mt-2">
            {hoveredEdge.type === 'auto' && '🤖 自動生成'}
            {hoveredEdge.type === 'manual' && '✋ 手動作成'}
          </div>
        </div>
      )}

      {/* 学習統計（右下に浮遊） */}
      <div className="absolute bottom-4 right-4 bg-slate-800/90 backdrop-blur-sm text-white p-4 rounded-lg border border-blue-400/30 shadow-lg shadow-blue-500/20">
        <div className="text-xs opacity-75 mb-2">🧠 メタブレイン統計</div>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between gap-4">
            <span className="opacity-75">星座の数</span>
            <span className="font-mono">{data.stats.totalNodes}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="opacity-75">つながり</span>
            <span className="font-mono">{data.stats.totalConnections}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="opacity-75">🌟 自分</span>
            <span className="font-mono">{data.stats.ownTopics}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="opacity-75">💎 いいね</span>
            <span className="font-mono">{data.stats.likedTopics}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="opacity-75">🔮 コメント</span>
            <span className="font-mono">{data.stats.commentedTopics}</span>
          </div>
        </div>
      </div>

      {/* ローディング状態 */}
      {data.nodes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white">
            <div className="text-6xl mb-4">🧠</div>
            <div className="text-lg mb-2">メタブレインを構築中...</div>
            <div className="text-sm opacity-60">
              あなたの知識の星座が生まれるのを待っています
            </div>
          </div>
        </div>
      )}
    </div>
  )
}