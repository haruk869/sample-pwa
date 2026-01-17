# Rules

## .claude配下の記述ルール
- 私（Claude）用のメモ領域
- 人間向け見栄え不要
- 必要な情報を必要なだけ、コンパクトに
- 情報欠落・曖昧さはNG

---

# このリポジトリ

## 概要
PWAサンプルアプリ（Next.js）

## URL
- GitHub: https://github.com/haruk869/sample-pwa
- Pages: https://haruk869.github.io/sample-pwa/

## 構成
- `/` - 統合ページ（PC: DL画面 / モバイル: アプリ + シート）
- PWA: manifest.json, sw.js, icons, screenshots

## スキルセット
vercel-react-best-practices 適用済

---

# PWA 作成要点

## manifest.json

### icons の purpose
- `"purpose": "any maskable"` は非推奨
- `any` と `maskable` は別エントリで定義する
```json
{ "src": "icon.png", "purpose": "any" },
{ "src": "icon.png", "purpose": "maskable" }
```

### screenshots（PC インストール UI 用）
- PC で Chrome のリッチなインストール UI を表示するには `form_factor: "wide"` のスクリーンショットが必須
- モバイル用は `form_factor: "narrow"`
```json
"screenshots": [
  { "src": "desktop.png", "sizes": "1280x720", "form_factor": "wide" },
  { "src": "mobile.png", "sizes": "390x844", "form_factor": "narrow" }
]
```

## beforeinstallprompt イベント

### 発火条件（Chrome）
- HTTPS
- 有効な manifest.json
- Service Worker 登録済み
- 未インストール（ブラウザが記憶）
- エンゲージメント要件を満たす

### インストール状態のリセット
- Clear site data だけでは不十分
- Chrome: アドレスバー → サイト設定 → アンインストール
- または chrome://apps からアンインストール

## iOS の制限

### beforeinstallprompt 非対応
- Safari は `beforeinstallprompt` をサポートしない
- ワンボタンインストール不可
- 「共有 → ホーム画面に追加」の手順案内が必要

### iOS バージョン判定
```javascript
const match = navigator.userAgent.match(/OS (\d+)_/);
const version = match ? parseInt(match[1], 10) : null;
```
- iOS 26+: 右下「•••」メニューから追加
- iOS 26未満: 下部「共有ボタン」から追加

## Service Worker

### キャッシュ対象
- HTML だけでなく JS/CSS アセット（`_next/static/`）もキャッシュ必須
- 2回目起動時にオフラインで動作しない原因になる

### キャッシュ戦略
- stale-while-revalidate が推奨
- キャッシュを即返しつつ、バックグラウンドで更新

## Next.js + GitHub Pages

### basePath 設定
- `next.config.ts` で `basePath: "/repo-name"` 設定
- ハードコードした `href="/repo-name/..."` は避ける
- `next/link` の `Link` を使えば basePath は自動付与

### 静的エクスポート
- `output: "export"` でビルド
- `out/` ディレクトリを GitHub Pages にデプロイ

## URL パラメータによる状態管理
- `?source=installed` - manifest の start_url に設定
- `?source=qr` - QR コードからのアクセス識別
- `display-mode: standalone` - インストール済み判定
