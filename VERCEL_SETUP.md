# 🚀 Vercel セットアップ手順（最終段階）

Supabase完了後、またはGitHubプッシュ完了後に実行

## 前提条件

✅ GitHubリポジトリにコードがプッシュ済み  
✅ Supabaseプロジェクト作成済み + 接続情報取得済み

## 1. Vercelプロジェクト作成

1. [Vercel.com](https://vercel.com) にアクセス
2. 「Sign up」→ GitHubアカウントで認証
3. 「Import Project」をクリック
4. GitHubリポジトリ `kokyou-no-kyoushitsu` を検索・選択

## 2. デプロイ設定

```
Project Name: kokyou-no-kyoushitsu
Framework Preset: Next.js
Root Directory: ./
Build Command: (デフォルトのまま)
Output Directory: (デフォルトのまま)
Install Command: (デフォルトのまま)
```

**まだ「Deploy」は押さない！**

## 3. 環境変数設定

「Environment Variables」セクションで以下を追加：

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://[Supabaseプロジェクト].supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJ[Supabaseのanon key]...` |

⚠️ Supabaseで取得した値を正確に入力

## 4. デプロイ実行

1. 環境変数設定完了後「Deploy」をクリック
2. **3-5分待機**（ビルド＆デプロイ中）

## 5. 完了確認

デプロイ成功後：

1. 生成されたURLをクリック（例：`https://kokyou-no-kyoushitsu.vercel.app`）
2. トップページが表示されることを確認
3. 「教師用ページ」でセッション作成をテスト
4. セッション作成時にSupabaseデータベースが使われることを確認

## 6. カスタムドメイン（オプション）

独自ドメインがある場合：
1. Vercelダッシュボード→「Settings」→「Domains」
2. カスタムドメインを追加

## 🎯 完了！

✅ 本番環境が完成！  
✅ 全国どこからでもアクセス可能  
✅ リアルタイム機能有効  
✅ 複数生徒同時接続可能  

**デプロイURL**: `https://kokyou-no-kyoushitsu.vercel.app`