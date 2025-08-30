/** @type {import('next').NextConfig} */
const nextConfig = {
  // 基本設定
  output: 'standalone',
  
  // パフォーマンス最適化
  experimental: {
    optimizePackageImports: ['vis-network', 'vis-data', '@supabase/supabase-js'],
  },

  // 本番環境向け最適化
  compress: true,
  
  // ESLintをビルド時にスキップ
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // TypeScriptエラーをビルド時にスキップ
  typescript: {
    ignoreBuildErrors: true,
  },

  // 画像最適化
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // ヘッダー設定
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          }
        ]
      },
      {
        source: '/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      }
    ]
  },

  // WebpackのChunk分割最適化
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: {
            minChunks: 1,
            priority: -20,
            reuseExistingChunk: true,
          },
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: -10,
            chunks: 'all',
          },
          vis: {
            test: /[\\/]node_modules[\\/](vis-network|vis-data)[\\/]/,
            name: 'vis-libs',
            priority: 10,
            chunks: 'all',
          },
          supabase: {
            test: /[\\/]node_modules[\\/]@supabase[\\/]/,
            name: 'supabase-libs',
            priority: 10,
            chunks: 'all',
          }
        }
      }
    }

    return config
  },

  // 環境変数の公開設定
  env: {
    NEXT_PUBLIC_APP_NAME: '公共のキョウシツ',
    NEXT_PUBLIC_APP_VERSION: process.env.npm_package_version,
  }
}

module.exports = nextConfig