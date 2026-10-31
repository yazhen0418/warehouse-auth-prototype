**English** | [繁體中文](README.zh-TW.md)

# Factory Inventory Scanning System (Prototype)

A prototype of an internal inventory-scanning system for factory use. Workers sign in on a phone or tablet and scan barcodes to record incoming goods. Each account can only be used on the device it is bound to.

> **Status: Prototype, development paused.** Sign-up, login and device binding are complete and tested. The back-end API for barcode scanning is not finished yet (paused after a change in requirements).

## Tech Stack

| Category | Technologies |
|---|---|
| Back end | Node.js, Express 5 (MVC architecture) |
| Front end | EJS server-side rendering (SSR), HTML / CSS, vanilla JavaScript (fetch) |
| Database | PostgreSQL (`pg` connection pool, parameterized queries) |
| Security | Random salt + HMAC-SHA512 password hashing, httpOnly cookies, device UUID binding |
| Deployment testing | Nginx reverse proxy, PM2 / NSSM (Windows service) |

## Features

- **Employee sign-up / login**: Employee ID is the username. Passwords are hashed with a random salt + HMAC-SHA512 before being stored; plain-text passwords are never saved.
- **Device binding**: The front end generates a UUID for each device. It is bound to the account on first login, and logins from any other device are rejected.
- **Login protection**: Visiting the home page without logging in redirects to the login page. Logging out clears the cookie.
- **Device detection**: Detects the operating system and device model using Client Hints + UAParser.js.
- **Barcode scanning UI**: The input box is auto-focused. When the scanner sends Enter, the data is submitted with fetch (back-end API in progress).

## Project Structure

```
├── server.js            # Entry point: middleware, routes, server startup
├── config/              # Database connection (reads settings from .env)
├── routes/              # Routes
├── controllers/         # Business logic (login, sign-up, pages)
├── models/              # SQL access
├── views/               # EJS pages (login, sign-up, home)
├── public/              # CSS and front-end JavaScript
└── schema.sql           # Table definitions (users, inventory_logs)
```

## Getting Started

1. Install [Node.js](https://nodejs.org/) and PostgreSQL.
2. Create a database named `node_project_demo2`, then run `schema.sql` to create the tables.
3. Copy `.env.example` to `.env` and fill in your database password (and any other settings you want to change).
4. Install dependencies and start the server:

   ```bash
   npm install
   npm run dev
   ```

5. Open `http://localhost:3000`.
   - Phones on the same network can connect at `http://<your-computer's-IP>:3000` (port 3000 must be allowed through the firewall).

## To Do

- [ ] Barcode scanning API (`POST /api/inventory`) that writes to `inventory_logs`
- [ ] Move the login check into a shared middleware
- [ ] Return errors as JSON and display them consistently on the front end