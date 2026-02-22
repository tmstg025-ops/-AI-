# 収支管理ツール 要件定義

作成日: 2026-02-22

---

## 1. プロジェクト概要

個人の資産・収支を一元管理するWebアプリケーション。銀行口座やクレジットカードの残高を登録し、収支の記録・集計・可視化を行う。

---

## 2. 機能要件

### 2.1 銀行/カード残高一覧

- 口座・カードを登録できる（名称、種別、現在残高）
- 種別: 銀行口座 / クレジットカード / 電子マネー / 現金
- 登録した口座の残高を手動で更新できる
- 一覧画面で全口座の残高を確認できる
- 全口座の合計資産額を表示する

**口座エンティティ:**

| フィールド | 型 | 説明 |
|---|---|---|
| id | string (UUID) | 主キー |
| name | string | 口座名（例: 三菱UFJ普通, 楽天カード） |
| type | enum | `bank` / `credit_card` / `e-money` / `cash` |
| balance | number | 現在残高（円） |
| currency | string | 通貨コード（デフォルト: JPY） |
| color | string | UI表示用カラーコード |
| createdAt | datetime | 作成日時 |
| updatedAt | datetime | 最終更新日時 |

### 2.2 収支の内訳

- 収支トランザクションを登録できる
- 種別: 収入 / 支出
- カテゴリを設定できる（自由に追加・編集可能）
- 収支記録に対象口座を紐付ける
- 月次・年次で収支を集計して一覧表示する
- カテゴリ別に集計した内訳（円グラフ）を表示する

**デフォルトカテゴリ:**

| 収入 | 支出 |
|---|---|
| 給与 | 食費 |
| 副業 | 日用品 |
| 投資収益 | 交通費 |
| その他収入 | 光熱費 |
| | 通信費 |
| | 家賃 |
| | 娯楽 |
| | 医療 |
| | その他支出 |

**トランザクションエンティティ:**

| フィールド | 型 | 説明 |
|---|---|---|
| id | string (UUID) | 主キー |
| type | enum | `income` / `expense` |
| amount | number | 金額（円、正の値） |
| categoryId | string | カテゴリID |
| accountId | string | 対象口座ID |
| description | string | メモ（任意） |
| date | date | 取引日 |
| createdAt | datetime | 作成日時 |

### 2.3 資産推移グラフ

- 全口座の合計資産額の時系列推移を折れ線グラフで表示する
- 期間フィルタ: 3ヶ月 / 6ヶ月 / 1年 / 全期間
- 口座別の残高推移を重ねて表示するオプション
- 月末時点の残高スナップショットをデータポイントとして使用する

**資産スナップショットエンティティ:**

| フィールド | 型 | 説明 |
|---|---|---|
| id | string (UUID) | 主キー |
| accountId | string | 対象口座ID |
| balance | number | スナップショット時点の残高 |
| recordedAt | datetime | 記録日時 |

---

## 3. 非機能要件

- **ユーザー認証:** 単一ユーザー（パスワード認証）。複数ユーザー対応は対象外。
- **レスポンシブ:** スマートフォン・PCブラウザ両対応
- **データ永続化:** ローカルDBに保存。外部サービス連携（銀行API等）は対象外。
- **オフライン:** 非対応（オンライン前提）

---

## 4. 技術スタック

CLAUDE.mdの「Simplicity first」方針に基づき、最小構成を選定する。

### フロントエンド

| 役割 | 採用技術 | 理由 |
|---|---|---|
| フレームワーク | Next.js (App Router) | フルスタック構成を1リポジトリで完結 |
| 言語 | TypeScript | 型安全性によるバグ抑制 |
| スタイリング | Tailwind CSS | ユーティリティクラスで最小限のCSS管理 |
| チャート | Recharts | React向け軽量チャートライブラリ |

### バックエンド

| 役割 | 採用技術 | 理由 |
|---|---|---|
| API | Next.js Route Handlers | 別サーバー不要、シンプルな構成 |
| ORM | Prisma | 型安全なDB操作、マイグレーション管理 |
| DB | SQLite | 初期段階はファイルベースDBで十分 |

### 開発ツール

| 役割 | 採用技術 |
|---|---|
| リンター | ESLint |
| フォーマッター | Prettier |
| テスト | Vitest |
| パッケージ管理 | npm |

> **スケールアップ時:** SQLite → PostgreSQL への移行はPrismaのスキーマ変更のみで対応可能。

---

## 5. 画面構成

```
/                    # ダッシュボード（資産推移グラフ + 残高一覧サマリ）
/accounts            # 口座一覧・登録・編集
/transactions        # 収支一覧・登録・編集
/transactions/new    # 収支登録フォーム
/reports             # 収支内訳（カテゴリ別円グラフ + 月次集計）
```

---

## 6. ディレクトリ構成

```
/
├── src/
│   ├── app/                  # Next.js App Router ページ・レイアウト
│   │   ├── api/              # Route Handlers（APIエンドポイント）
│   │   │   ├── accounts/
│   │   │   ├── transactions/
│   │   │   └── snapshots/
│   │   ├── accounts/
│   │   ├── transactions/
│   │   └── reports/
│   ├── components/           # 再利用可能なUIコンポーネント
│   │   ├── charts/           # グラフ関連コンポーネント
│   │   └── ui/               # ボタン・フォーム等の基本コンポーネント
│   ├── lib/                  # DB接続・ユーティリティ
│   └── types/                # 共通型定義
├── prisma/
│   └── schema.prisma         # DBスキーマ定義
├── tests/                    # Vitestテストファイル
├── .env.example              # 環境変数テンプレート
├── CLAUDE.md
└── DOCS.md
```

---

## 7. 環境変数

```
DATABASE_URL="file:./dev.db"   # SQLite DBファイルパス
```

---

## 8. 開発コマンド（予定）

```bash
# 依存関係インストール
npm install

# 開発サーバー起動
npm run dev

# DBマイグレーション
npx prisma migrate dev

# テスト
npm run test

# リント
npm run lint

# フォーマット
npm run format
```

---

## 9. 対象外（スコープ外）

- 銀行・カード会社APIとの自動連携
- 複数ユーザー対応・マルチテナント
- 予算管理・目標設定機能
- 外貨・仮想通貨の換算
- モバイルアプリ（iOS/Android）
