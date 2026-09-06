# Tap Empire — Telegram Mini App

Production-oriented Telegram Tap-to-Earn application with React/Vite frontend, Express/Node backend, MySQL persistence, Telegram Mini App authentication, browser installer, admin dashboard, anti-cheat controls, referrals, tasks, boosts and withdrawals.

## cPanel / Shared Hosting

### 1. Requirements
- Node.js 20+ (Node 24 is used by CI)
- npm 10+
- MySQL 8+ or compatible MariaDB
- HTTPS domain
- cPanel Node.js Application / Passenger support

### 2. Upload
Upload the repository contents to the application root. Do not upload `.git` or `node_modules`.

### 3. Install dependencies and build
In cPanel's Node.js application environment:

```text
npm install --no-audit --no-fund
npm run build
```

Startup file:

```text
dist/server.cjs
```

Start command:

```text
npm start
```

### 4. Environment variables
Set these in the cPanel Node.js application environment. Do not hard-code them in source files.

```text
NODE_ENV=production
APP_ENV=production
PORT=<cPanel assigned port>
DB_HOST=<mysql host>
DB_PORT=3306
DB_DATABASE=<database name>
DB_USERNAME=<database user>
DB_PASSWORD=<database password>
ADMIN_JWT_SECRET=<long random secret>
USER_AUTH_SECRET=<long random secret>
TELEGRAM_BOT_TOKEN=<BotFather token>
TELEGRAM_BOT_USERNAME=<bot username>
```

Production startup intentionally fails when required database/auth variables are missing.

### 5. Browser installer
Open:

```text
https://YOUR-DOMAIN.example/install
```

Enter the real MySQL credentials, Telegram bot token, Mini App URL, economy settings and a new administrator password. The installer tests the database, runs migrations and configures Telegram integration.

Never reuse credentials shown in screenshots, examples or old documentation.

## Telegram

Create the bot with `@BotFather`, configure the Mini App HTTPS URL, and use the installer to validate the token and register the application's Telegram integration.

## Security

- Telegram Mini App `initData` is server-verified.
- User balances are stored in MySQL, not browser storage.
- Tap batches use server-side validation and replay protection.
- Withdrawal approval requires a real transaction hash entered by an administrator.
- Production database configuration has no silent credential fallback.
- No demo administrator password is shipped to the browser.

## Development

```text
npm install
npm run dev
```

## Validation

Every push to `main` runs type checking, a production build and a static source security scan.
