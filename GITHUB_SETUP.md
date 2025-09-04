# 📋 GitHub セットアップ手順

## 1. GitHubでリポジトリ作成

1. [GitHub.com](https://github.com)にアクセス
2. 右上の「+」→「New repository」をクリック
3. リポジトリ設定：
   - **Repository name**: `kokyou-no-kyoushitsu`
   - **Description**: `🏛️ 民主主義授業支援プラットフォーム - 高校社会科「公共」向けリアルタイム協働学習システム`
   - **Visibility**: Public（または Private）
   - **Initialize**: チェックを外す（既存コードがあるため）

4. 「Create repository」をクリック

## 2. ローカルからプッシュ

GitHubリポジトリ作成後、以下のコマンドを実行：

```bash
# リモートリポジトリ追加
git remote add origin https://github.com/[あなたのユーザー名]/kokyou-no-kyoushitsu.git

# ブランチ名をmainに設定
git branch -M main

# 初回プッシュ
git push -u origin main
```

## 3. 完了確認

- GitHubページでファイルが正常にアップロードされていることを確認
- README.mdがきちんと表示されていることを確認