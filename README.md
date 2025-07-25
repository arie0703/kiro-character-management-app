# 人物管理アプリケーション

歴史上の人物を記録・管理したり、知り合いの人間関係を可視化するためのWebアプリケーションです。

## 機能

- **グループ管理**: 人物を整理するためのグループの作成・管理
- **人物情報管理**: 写真、名前、情報、関連リンクの登録・編集
- **ラベル機能**: 人物への最大5つまでのラベル付与による分類
- **人物間関係管理**: 同一グループ内での双方向関係の定義
- **関係図の視覚化**: D3.jsを使用した人間関係のグラフィカル表示
- **データの永続化**: MySQLデータベースによるデータ保存

## 技術スタック

### バックエンド
- **言語**: Go 1.21+
- **Webフレームワーク**: Gin
- **ORM**: GORM
- **データベース**: MySQL 8.0+
- **バリデーション**: go-playground/validator

### フロントエンド
- **フレームワーク**: React 18 + TypeScript + Vite
- **状態管理**: Zustand
- **データ可視化**: D3.js v7
- **HTTP通信**: Axios
- **スタイリング**: Tailwind CSS + Headless UI

## 前提条件

### Docker使用時（推奨）
- Docker
- Docker Compose

### ローカル開発時
- Go 1.21以上
- Node.js 18以上
- MySQL 8.0以上

## セットアップ

### 1. リポジトリのクローン

```bash
git clone <repository-url>
cd character-management-app
```

### 2. Dockerを使用した起動（推奨）

```bash
# アプリケーション全体を起動
docker-compose up -d

# ログを確認
docker-compose logs -f

# アプリケーションを停止
docker-compose down

# データベースも含めて完全に削除
docker-compose down -v
```

アクセス先：
- フロントエンド: http://localhost:3000
- バックエンドAPI: http://localhost:8080
- MySQL: localhost:3306

### 3. ローカル開発環境のセットアップ

#### データベースの準備

MySQLサーバーを起動し、データベースを作成します：

```sql
CREATE DATABASE character_management CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

#### バックエンドのセットアップ

```bash
cd backend

# 依存関係のインストール
go mod tidy

# 環境変数ファイルの作成
cp .env.example .env

# .envファイルを編集してデータベース接続情報を設定
# DB_HOST=localhost
# DB_PORT=3306
# DB_USER=root
# DB_PASSWORD=your_password
# DB_NAME=character_management
```

#### フロントエンドのセットアップ

```bash
cd frontend

# 依存関係のインストール
npm install
```

## 開発環境での実行

### Dockerを使用した実行

```bash
# 全サービスを起動
docker-compose up -d

# 特定のサービスのログを確認
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mysql

# 特定のサービスを再起動
docker-compose restart backend

# データベースに接続
docker-compose exec mysql mysql -u app_user -papp_password character_management

# バックエンドコンテナに接続
docker-compose exec backend sh
```

### ローカルでの実行

#### バックエンドサーバーの起動

```bash
cd backend
go run cmd/server/main.go
```

サーバーは `http://localhost:8080` で起動します。

#### フロントエンドサーバーの起動

```bash
cd frontend
npm run dev
```

フロントエンドは `http://localhost:3000` で起動します。

## API エンドポイント

### ヘルスチェック
- `GET /health` - データベース接続の確認

### グループ管理
- `GET /api/v1/groups` - グループ一覧取得
- `POST /api/v1/groups` - グループ作成
- `GET /api/v1/groups/:id` - グループ詳細取得
- `PUT /api/v1/groups/:id` - グループ更新
- `DELETE /api/v1/groups/:id` - グループ削除

### 人物管理
- `GET /api/v1/characters` - 人物一覧取得
- `POST /api/v1/characters` - 人物作成
- `GET /api/v1/characters/:id` - 人物詳細取得
- `PUT /api/v1/characters/:id` - 人物更新
- `DELETE /api/v1/characters/:id` - 人物削除

### ラベル管理
- `GET /api/v1/labels` - ラベル一覧取得
- `POST /api/v1/labels` - ラベル作成
- `GET /api/v1/labels/:id` - ラベル詳細取得
- `PUT /api/v1/labels/:id` - ラベル更新
- `DELETE /api/v1/labels/:id` - ラベル削除

### 関係管理
- `GET /api/v1/relationships` - 関係一覧取得
- `POST /api/v1/relationships` - 関係作成
- `GET /api/v1/relationships/:id` - 関係詳細取得
- `PUT /api/v1/relationships/:id` - 関係更新
- `DELETE /api/v1/relationships/:id` - 関係削除

## テスト

### Dockerを使用したテスト

```bash
# バックエンドテスト
docker-compose exec backend go test ./...

# フロントエンドテスト
docker-compose exec frontend npm test
```

### ローカルでのテスト

```bash
# バックエンドテスト
cd backend
go test ./...

# フロントエンドテスト
cd frontend
npm test
```

## ビルド

### バックエンドビルド

```bash
cd backend
go build -o bin/server cmd/server/main.go
```

### フロントエンドビルド

```bash
cd frontend
npm run build
```

## 環境変数

### バックエンド (.env)

```env
# データベース設定
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=password
DB_NAME=character_management

# データベース接続プール設定
DB_MAX_OPEN_CONNS=25
DB_MAX_IDLE_CONNS=5
DB_MAX_LIFETIME=300
DB_LOG_LEVEL=info

# サーバー設定
PORT=8080
GIN_MODE=debug

# ファイルアップロード設定
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760  # 10MB
```

## ディレクトリ構造

```
character-management-app/
├── backend/
│   ├── cmd/
│   │   └── server/
│   │       └── main.go
│   ├── internal/
│   │   ├── config/
│   │   ├── handlers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── repositories/
│   │   └── services/
│   ├── go.mod
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── stores/
│   │   ├── types/
│   │   └── utils/
│   ├── package.json
│   └── vite.config.ts
├── .gitignore
└── README.md
```

## 開発ガイドライン

1. **コミットメッセージ**: 日本語または英語で明確に記述
2. **コードスタイル**: 
   - Go: `gofmt`を使用
   - TypeScript: ESLintとPrettierを使用
3. **テスト**: 新機能追加時は対応するテストも作成
4. **API設計**: RESTfulな設計に従う

## トラブルシューティング

### Docker関連

#### ポートが既に使用されている場合
```bash
# 使用中のポートを確認
lsof -i :3000
lsof -i :8080
lsof -i :3306

# プロセスを終了
kill -9 <PID>
```

#### データベース接続エラー
```bash
# MySQLコンテナの状態を確認
docker-compose ps mysql

# MySQLログを確認
docker-compose logs mysql

# データベースに手動接続してテスト
docker-compose exec mysql mysql -u app_user -papp_password character_management
```

#### コンテナビルドエラー
```bash
# キャッシュをクリアして再ビルド
docker-compose down
docker system prune -f
docker-compose up --build
```

#### ヘルスチェック失敗
```bash
# 各サービスの状態を確認
docker-compose ps

# 特定のサービスのログを確認
docker-compose logs backend
docker-compose logs frontend
docker-compose logs mysql
```

### ローカル開発関連

#### データベース接続エラー

1. MySQLサーバーが起動していることを確認
2. `.env`ファイルの接続情報が正しいことを確認
3. データベースが作成されていることを確認

#### ポート競合エラー

- バックエンド: `PORT`環境変数で別のポートを指定
- フロントエンド: `vite.config.ts`でポート設定を変更

#### CORS エラー

- バックエンドのCORSミドルウェア設定を確認
- フロントエンドのプロキシ設定を確認

## ライセンス

MIT License