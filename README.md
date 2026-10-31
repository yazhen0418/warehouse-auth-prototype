**English** | [繁體中文](README.zh-TW.md)

# Warehouse Authentication and Device Authorization Prototype

A warehouse-system prototype based on a factory-management requirement. It implements employee registration, login, and account binding to a browser UUID. Development of the planned barcode-scanning workflow was paused after requirements changed.

> **Status: Prototype, development paused.**
> Authentication still requires improvements, and the application is not ready for production use.

## Tech Stack

| Category | Technologies |
| --- | --- |
| Backend | JavaScript, Node.js, Express 5 (Routes / Controllers / Models layers) |
| Page rendering | EJS server-side rendering, HTML, CSS |
| Browser-side code | Vanilla JavaScript, localStorage |
| Database | PostgreSQL, pg connection pool, parameterized queries |
| Password handling | Random salt with HMAC-SHA512 |

## Features

- **Employee registration and login**: Uses employee IDs as account identifiers. Passwords are hashed using a random salt with HMAC-SHA512 and stored in `salt$hash` format. Plain-text passwords are not stored.
- **Browser UUID binding and comparison**: The browser generates a UUID and stores it in localStorage. It is associated with the account during registration and checked at login. Accounts without a bound UUID can be bound during login. The UUID can be modified or cleared and does not prove physical device identity.
- **Basic login-state handling**: The home page checks whether a login cookie exists to determine whether to display the page or redirect to login. Logout clears the login identifier cookie. Full login-state validation still requires improvement.
- **Device information detection**: Uses Client Hints and UAParser.js to infer operating-system and device information. Some display logic still needs correction.

## Project Structure

```text
├── server.js        # Express configuration, route mounting, and server startup
├── config/          # PostgreSQL connection settings
├── routes/          # Routes
├── controllers/     # Registration, login, and page logic
├── models/          # Database queries
├── middleware/      # Middleware (planned)
├── views/           # EJS page templates
├── public/          # CSS and browser-side JavaScript
└── schema.sql       # Database schema
```

## Getting Started

### 1. Prepare the environment and database

Install Node.js 18 or later and PostgreSQL.

Create a new development database, such as `node_project_demo2`, and execute `schema.sql` against that database.

### 2. Configure environment variables

Copy `.env.example` to `.env` and enter your local PostgreSQL settings.

Do not commit a `.env` file containing real credentials to Git.

### 3. Install dependencies and start the application

Run the following commands in the project directory containing `package.json`:

```bash
npm install
npm run dev
```

### 4. Open the application

Open http://localhost:3000/auth/login, register a development account, and log in using the same browser.

## Future Improvements

- Implement server-side sessions and shared authentication middleware to improve login-state validation
- Migrate to a dedicated password-hashing algorithm, such as Argon2id
- Complete server-side input validation and verify UUID-binding results
- Complete the barcode-scanning interface and inventory API to write records to `inventory_logs`