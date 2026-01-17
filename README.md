# Sample PWA

Next.js で構築した PWA（Progressive Web App）のサンプルアプリケーションです。

## デモ

https://haruk869.github.io/sample-pwa/

## 作成要件

- PWA の基本機能をシンプルに実装したサンプル
- インストール可能なアプリとして動作
- オフライン対応
- iOS / Android 両対応
- GitHub Pages でホスティング

## 技術スタック

| 項目 | 技術 |
|------|------|
| フレームワーク | Next.js 16 |
| 言語 | TypeScript |
| スタイリング | Tailwind CSS 4 |
| ホスティング | GitHub Pages |
| CI/CD | GitHub Actions |

## プロジェクト構成

```
sample-pwa/
├── src/app/
│   ├── layout.tsx      # ルートレイアウト（メタデータ・PWA設定）
│   ├── page.tsx        # ダウンロードページ
│   ├── app/
│   │   └── page.tsx    # サンプルアプリ（カウンター）
│   └── globals.css     # グローバルスタイル
├── public/
│   ├── manifest.json   # Web App Manifest
│   ├── sw.js           # Service Worker
│   └── icons/          # PWA アイコン（192x192, 512x512）
└── next.config.ts      # Next.js 設定（静的エクスポート）
```

## ページ紹介

### ダウンロードページ（`/`）

PWA のインストールを促すランディングページです。

**機能:**
- アプリインストールボタン（Chrome / Edge 対応）
- iOS 向け手動インストール手順の表示
- インストール済み検出
- Web 版で試すリンク

### サンプルアプリ（`/app`）

PWA として動作するサンプルアプリケーションです。

**機能:**
- カウンター（+1 / -1 / リセット）
- リアルタイム時計表示
- PWA 機能一覧の表示

## PWA 機能

| 機能 | 実装 |
|------|------|
| インストール | `beforeinstallprompt` イベント対応 |
| オフライン | Service Worker によるキャッシュ戦略 |
| アイコン | 192x192 / 512x512（maskable 対応）|
| スプラッシュ | manifest.json で設定 |
| スタンドアロン | `display: standalone` |
| テーマカラー | `#4f46e5`（インディゴ）|

## 開発

```bash
# 依存関係インストール
npm install

# 開発サーバー起動
npm run dev

# ビルド（静的エクスポート）
npm run build
```

## デプロイ

`main` ブランチへの push で GitHub Actions が自動デプロイを実行します。

出力先: `out/` → GitHub Pages
