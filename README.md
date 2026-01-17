# Sample PWA

Next.js で構築した PWA（Progressive Web App）のサンプルアプリケーションです。

## デモ

https://haruk869.github.io/sample-pwa/

![QR Code](https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://haruk869.github.io/sample-pwa/?source=qr)

---

### Why PWA?

**アプリストア不要。QRコードひとつで、即座に配布。**

PWA（Progressive Web App）は、Web 技術でネイティブアプリのような体験を実現します。

- **インストールが簡単** — ストア申請なし、QR コードをスキャンするだけ
- **アップデートは瞬時** — push したら即反映、ユーザーの操作不要
- **オフライン対応** — Service Worker がアセットをキャッシュ
- **クロスプラットフォーム** — iOS / Android / PC、すべて同じコードベース

このサンプルは **GitHub Pages（静的ホスティング）だけ**で動作します。サーバーサイド処理は一切不要。
React + Next.js という既存の Web 技術スタックのまま活用し、特別なフレームワーク等なしで PWA として構築できることを示しています。

---

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
│   ├── page.tsx        # メインページ（PC: DL画面 / モバイル: アプリ）
│   └── globals.css     # グローバルスタイル
├── public/
│   ├── manifest.json   # Web App Manifest
│   ├── sw.js           # Service Worker
│   ├── icons/          # PWA アイコン
│   └── screenshots/    # インストール画面用スクリーンショット
└── next.config.ts      # Next.js 設定（静的エクスポート）
```

## 画像アセット

実際のアプリに置き換える場合は、以下のファイルを差し替えてください。

### アイコン

| ファイル | サイズ | 用途 |
|----------|--------|------|
| `public/icons/icon-192.png` | 192x192 | ホーム画面アイコン |
| `public/icons/icon-512.png` | 512x512 | スプラッシュ画面 |

### スクリーンショット

| ファイル | サイズ | 用途 |
|----------|--------|------|
| `public/screenshots/desktop.png` | 1280x720 | PC インストール UI（form_factor: wide） |
| `public/screenshots/mobile.png` | 390x844 | モバイル インストール UI（form_factor: narrow） |

## ページ紹介

単一ページ（`/`）で端末に応じた表示を切り替えます。

| 環境 | 表示内容 |
|------|----------|
| PC ブラウザ | ダウンロードページ（インストールボタン + QRコード） |
| モバイル ブラウザ | アプリ画面 + インストール案内シート |
| インストール後 | アプリ画面のみ |

**アプリ機能:**
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
インストール済みアプリは次回起動時に自動更新されます（Service Worker の stale-while-revalidate 戦略）。

出力先: `out/` → GitHub Pages
