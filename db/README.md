# postgres

以下コマンドは `src/frameworks-drivers/db/postgres/` 直下で実行します。

## Local environment

### 🐘 Postgresコンテナの起動

```bash
pnpm up
```

> `--env-file` により `.env.local` の環境変数（ユーザー名、DB名、ポートなど）を適用して起動します。


### Shat down local environment

```bash
pnpm down
```

### Shat down local environment and delete volumes
```bash
pnpm downv
```

### 🔁 スキーマからマイグレーションファイルを生成（`generate`）

```bash
pnpm gen
```

### 🚀 DBにマイグレーションを適用（`push`）

```bash
pnpm 
```

### 📜 マイグレーションファイルを適用（`migrate`）

```bash
pnpm migrate
```

### 📜 Drizzle Postgres UI を軌道（`studio`）

```bash
pnpm studio
```
