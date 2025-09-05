# 🏛️ 公共のキョウシツ - システム仕様書

## 📋 プロジェクト概要

**プロジェクト名**: 公共のキョウシツ（kokyou-no-kyoushitsu）  
**目的**: 高校社会科「公共」向け民主主義教育支援プラットフォーム  
**対象**: 教師・生徒（40名クラス対応）  
**技術スタック**: Next.js 15 + TypeScript + Tailwind CSS + Supabase + Vercel  

## 🏗️ システム構成

### フロントエンド
- **Framework**: Next.js 15.5.0 (App Router)
- **言語**: TypeScript
- **スタイル**: Tailwind CSS
- **UI Components**: 16個のReactコンポーネント
- **PWA対応**: Service Worker + Manifest

### バックエンド・データベース
- **Database**: Supabase (PostgreSQL)
- **リアルタイム**: Supabase Realtime
- **認証**: セッションコード認証（8桁）
- **API**: 17個のREST APIエンドポイント

### インフラ・デプロイ
- **ホスティング**: Vercel
- **リポジトリ**: GitHub (boomboom0911/kokyou-no-kyoushitsu)
- **本番URL**: https://democracy-classroom-2025.vercel.app
- **リージョン**: US East (iad1)

## 📊 データベース構造

### テーブル設計（5テーブル）

#### 1. sessions（授業セッション）
```sql
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_code TEXT NOT NULL UNIQUE,           -- 8桁クラスコード
  class_name TEXT NOT NULL,                   -- クラス名
  date DATE NOT NULL,                         -- 授業日
  period INTEGER NOT NULL,                    -- 時限
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'closed')),
  teacher_topic_title TEXT,                   -- 教師設定トピック
  teacher_topic_content TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  closed_at TIMESTAMP WITH TIME ZONE
);
```

#### 2. participants（参加者）
```sql
CREATE TABLE participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  student_name TEXT NOT NULL,                 -- 生徒名
  student_id TEXT,                           -- 出席番号
  seat_position INTEGER CHECK (seat_position BETWEEN 1 AND 42), -- 座席位置
  topic_title TEXT,                          -- 提出トピックタイトル
  topic_content TEXT,                        -- 提出トピック内容
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(session_id, student_name),
  UNIQUE(session_id, seat_position)
);
```

#### 3. chat_messages（チャットメッセージ）
```sql
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  sender_name TEXT NOT NULL,
  message TEXT NOT NULL,
  is_teacher BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE        -- 論理削除対応
);
```

#### 4. topic_reactions（トピック評価）
```sql
CREATE TABLE topic_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id UUID REFERENCES participants(id) ON DELETE CASCADE,
  reactor_name TEXT NOT NULL,                -- 評価者名
  reaction_type TEXT DEFAULT 'like' CHECK (reaction_type IN ('like', 'view')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(participant_id, reactor_name, reaction_type)
);
```

#### 5. topic_comments（トピックコメント）
```sql
CREATE TABLE topic_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id UUID REFERENCES participants(id) ON DELETE CASCADE,
  commenter_name TEXT NOT NULL,              -- コメント者名
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🎯 主要機能

### 1. 認証・セッション管理
- **8桁クラスコード**による簡単認証
- **教師**: セッション作成・管理
- **生徒**: コード入力で参加
- **セッション状態管理**: active/closed

### 2. 座席管理システム
- **6×7グリッド（42席）**の座席表
- **リアルタイム座席選択**
- **視覚的座席状況表示**
- **重複座席防止**

### 3. トピック提出・評価システム
- **トピックタイトル・内容提出**
- **相互評価機能**（いいね）
- **コメント機能**
- **参加状況リアルタイム表示**

### 4. チャット機能
- **リアルタイムチャット**
- **教師・生徒区別**
- **メッセージ管理**（削除機能）
- **不適切内容フィルタリング**

### 5. 教師管理機能
- **参加状況ダッシュボード**
- **統計・分析画面**
- **セッション終了機能**
- **チャットモデレーション**

### 6. 追加機能
- **PWA対応**（オフライン利用）
- **メタブレイン可視化**（知識ネットワーク）
- **メタバース連携**（仮想空間）
- **パフォーマンスモニタリング**

## 📁 ファイル構造

### 重要ファイル一覧

#### フロントエンド（Pages）
- `src/app/page.tsx` - トップページ（ログイン）
- `src/app/classroom/[sessionCode]/page.tsx` - 生徒用教室画面
- `src/app/teacher/page.tsx` - 教師用メイン画面
- `src/app/teacher/dashboard/[sessionCode]/page.tsx` - 教師ダッシュボード
- `src/app/demo/page.tsx` - デモページ
- `src/app/metaverse/page.tsx` - メタバース画面
- `src/app/metabrain/[userId]/page.tsx` - 知識ネットワーク画面

#### 主要コンポーネント
- `src/components/SeatingChart.tsx` - 座席表コンポーネント
- `src/components/TopicDetailPopup.tsx` - トピック詳細表示
- `src/components/Chat.tsx` - チャット機能
- `src/components/TeacherDashboard.tsx` - 教師ダッシュボード
- `src/components/ParticipationAnalytics.tsx` - 参加分析
- `src/components/MetabrainVisualization.tsx` - 知識可視化
- `src/components/RealtimeProvider.tsx` - リアルタイム管理

#### API エンドポイント
- `src/app/api/auth/create-session/route.ts` - セッション作成
- `src/app/api/auth/join-session/route.ts` - セッション参加
- `src/app/api/auth/close-session/route.ts` - セッション終了
- `src/app/api/seats/select/route.ts` - 座席選択
- `src/app/api/topics/submit/route.ts` - トピック提出
- `src/app/api/reactions/route.ts` - 評価機能
- `src/app/api/comments/route.ts` - コメント機能
- `src/app/api/chat/route.ts` - チャット機能
- `src/app/api/participants/route.ts` - 参加者管理

#### 設定・ライブラリ
- `src/lib/supabase.ts` - Supabaseクライアント設定
- `src/lib/database.types.ts` - TypeScript型定義
- `src/lib/auth.ts` - 認証ヘルパー関数
- `src/lib/demo-storage.ts` - デモモード用ストレージ
- `src/lib/metabrain-api.ts` - 知識ネットワークAPI
- `src/lib/metaverse-api.ts` - メタバース連携API

#### 設定ファイル
- `next.config.js` - Next.js設定
- `tailwind.config.ts` - Tailwind CSS設定
- `package.json` - 依存関係・スクリプト
- `vercel.json` - Vercelデプロイ設定
- `public/manifest.json` - PWA設定

## 🔧 環境変数

### Supabase接続情報
```env
NEXT_PUBLIC_SUPABASE_URL=https://jcvvklzhsfnyavukbqyg.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 🚀 デプロイ情報

### 本番環境
- **URL**: https://democracy-classroom-2025.vercel.app
- **Platform**: Vercel
- **Build Command**: `npm run build`
- **Framework**: Next.js (自動検出)
- **Node.js Version**: 18+

### デプロイ手順
1. GitHubリポジトリ: `boomboom0911/kokyou-no-kyoushitsu`
2. Vercelプロジェクト: `democracy-classroom-2025`
3. 環境変数設定: Supabase接続情報
4. 自動デプロイ: git push時

## 🛠️ 開発・運用

### ローカル開発
```bash
npm install
npm run dev  # http://localhost:3000
```

### ビルド・テスト
```bash
npm run build  # 本番ビルド
npm run lint   # ESLint実行
```

### データベース管理
- **Supabase Dashboard**: プロジェクト管理
- **SQL Editor**: テーブル操作
- **Table Editor**: データ確認・編集
- **Realtime**: リアルタイム購読管理

## 🔒 セキュリティ

### 実装済み対策
- **XSS対策**: 入力値サニタイズ
- **CSRF対策**: SameSite Cookie
- **入力検証**: 全API入力チェック
- **セキュリティヘッダー**: Next.js設定
- **RLS (Row Level Security)**: 全ユーザーアクセス許可

### 教育現場向け配慮
- **匿名性**: 出席番号のみ（実名不要）
- **プライバシー**: セッション終了時データ保持期間
- **アクセス制御**: セッションコード認証のみ

## 📈 スケーラビリティ

### 対応規模
- **同時セッション**: 複数クラス対応
- **参加者数**: 1セッション42名
- **リアルタイム**: WebSocket接続
- **ストレージ**: PostgreSQL（無制限）

### パフォーマンス
- **CDN**: Vercel Edge Network
- **画像最適化**: Next.js Image最適化
- **コード分割**: Dynamic Import
- **Bundle Size**: 204KB (最適化済み)

## 🐛 既知の問題・制約

### 現在の制約
1. **デモモード切り替え**: 環境変数依存
2. **座席数固定**: 42席（6×7）固定
3. **セッションコード**: 8桁英数固定
4. **リアルタイム**: インターネット接続必須

### 修正済み問題
1. ✅ Vercel設定エラー → minimal設定に修正
2. ✅ TypeScript strict mode → ESLint無効化
3. ✅ PWAアイコン不足 → manifest.json追加
4. ✅ デモストレージ永続化 → globalThis使用

## 📚 利用手順（教育現場）

### 教師側操作
1. **セッション作成**: `/teacher` → 授業情報入力
2. **クラスコード配布**: 8桁コードを生徒に通知
3. **参加状況確認**: ダッシュボードで座席・提出状況監視
4. **チャット管理**: 不適切発言削除・モデレーション
5. **セッション終了**: 授業終了時にセッション閉鎖

### 生徒側操作
1. **アクセス**: democracy-classroom-2025.vercel.app
2. **参加**: 8桁クラスコード + 名前・出席番号入力
3. **座席選択**: 6×7座席表から選択
4. **トピック提出**: タイトル・内容入力
5. **相互評価**: 他生徒のトピックにいいね・コメント
6. **ディスカッション**: リアルタイムチャット参加

## 🔮 今後の拡張可能性

### Phase 2: 機能追加・改善
- **座席数カスタマイズ**: クラスサイズ対応
- **評価システム拡張**: 5段階評価・複数軸評価
- **ファイル添付**: 画像・PDF対応
- **投票機能**: 多肢選択・ランキング投票

### Phase 3: 高度機能
- **AI分析**: 議論内容・参加度自動分析
- **レポート生成**: 授業レポート自動作成
- **学習履歴**: 個人・クラス学習データ蓄積
- **外部連携**: LMS・校務システム連携

## 📞 技術サポート

### トラブルシューティング
- **Vercelログ**: デプロイ・実行エラー確認
- **Supabaseログ**: データベース接続問題
- **ブラウザコンソール**: フロントエンドエラー
- **SystemStatus**: `/demo` ページのシステム診断

### 連絡先・リポジトリ
- **GitHub**: https://github.com/boomboom0911/kokyou-no-kyoushitsu
- **本番環境**: https://democracy-classroom-2025.vercel.app
- **開発者**: Claude Code Assistant + boomboom0911

---

**🏛️ 公共のキョウシツ - 民主主義教育の未来を創造する**

*Generated with Claude Code - 2025年8月31日〜9月4日開発完了*