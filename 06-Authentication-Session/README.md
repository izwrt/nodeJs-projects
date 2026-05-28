# 🔐 Session-Based Authentication (The Stateful Way)

Welcome to the **06-Authentication-Session** project! This module is a deep dive into building a robust, production-grade, **stateful** authentication system from scratch using Node.js, Express, TypeScript, PostgreSQL, and Drizzle ORM.

Instead of relying on third-party services, this project demonstrates how to securely hash passwords, manage user sessions in a database, and protect API routes.

---

## 🛠️ What We Built

In this project, we implemented a complete authentication pipeline:

1. **Secure Signup (`POST /signup`):** 
   - Takes user credentials and generates a cryptographically secure random `salt`.
   - Hashes the password using `HMAC-SHA256` combined with the salt.
   - Saves the user safely to the PostgreSQL database.
2. **Session Login (`POST /login`):** 
   - Verifies the user's password against the stored hash.
   - Generates a unique **Session ID** and stores it in the `user_sessions` database table.
   - Returns the `sessionId` to the client.
3. **Protected Routes (`GET /`):** 
   - Uses custom Express middleware to intercept incoming requests.
   - Reads the `session-id` from the request headers.
   - Queries the database to ensure the session is valid and hasn't expired.
   - Attaches the `user` object to the Express `req` object for downstream use.

---

## 🧠 Deep Dive: How Session-Based Authentication Works

Imagine a highly exclusive VIP club. 

When you arrive at the club for the first time (Login), you show your ID and password. The bouncer verifies who you are. Instead of making you show your ID every time you go to the bar or the dance floor, the bouncer writes your name on a clipboard and hands you a **wristband with a random number on it**. 

* The **Clipboard** is our Database (`user_sessions` table).
* The **Wristband** is the `sessionId` sent to the client.

Every time you want to do something in the club (make an API request), you show your wristband. The bouncer looks at the number, checks the clipboard, finds your name, and lets you in.

### The Technical Flow:
1. Client sends `email` and `password`.
2. Server verifies credentials.
3. Server creates a record in the database: `{ id: "session_123", userId: "user_456", createdAt: "..." }`.
4. Server sends `"session_123"` back to the client.
5. Client stores this ID (usually in a secure HTTP-only cookie, or in memory).
6. On the next request, the client sends `"session_123"` in the headers.
7. Server looks up `"session_123"` in the database. If it exists, the user is authenticated!

---

## 🏛️ What does "Stateful" mean?

Session-based authentication is a **Stateful** architecture. 

**"Stateful" means the server has a memory.** The server actively keeps track of exactly who is logged in at any given moment by storing their "state" (the session) in its database or memory (like Redis).

If the server's database is wiped, or if the server deletes the session record, the user is instantly logged out, even if they still have the `sessionId` on their computer. The wristband is useless if the bouncer crosses your name off the clipboard.

---

## ⚔️ The Great Debate: Sessions vs. JWT (Stateless)

If you've been around web development, you've heard of **JWT (JSON Web Tokens)**. JWT is a **Stateless** architecture. 

In a JWT system, the bouncer doesn't have a clipboard. Instead, when you log in, the bouncer gives you an ID card that is *cryptographically signed* with an unforgeable wax seal. When you want to enter a room, the bouncer just looks at the wax seal. If it's valid, you get in. The server doesn't need to look up a database to know who you are; the token itself contains your identity.

### Why use Stateful Sessions instead of JWT?

While JWTs are incredibly popular (and great for microservices), **Session-based auth is often considered more secure and controllable for standard web applications.** Here is why:

#### 1. The Revocation Problem (The biggest flaw of JWT)
If a hacker steals a user's JWT, they can impersonate that user until the token expires. Because the server is *stateless* (no clipboard), it cannot easily "cancel" a specific JWT. 
With **Sessions**, if an account is compromised, the server simply deletes the session ID from the database. The hacker's token instantly becomes useless. **Instant revocation is built-in.**

#### 2. Device Management
Have you ever used the "Log out of all other devices" button on Netflix or GitHub? That is incredibly easy with Sessions. You just delete all rows in the `user_sessions` table for that `userId`. Doing this with stateless JWTs is notoriously difficult and requires building complex blocklists (which ironically makes the system stateful again).

#### 3. Data Freshness
A JWT contains user data (like roles or email) encoded inside it. If a user changes their email, or an admin revokes their "Pro" status, the JWT still holds the old data until it expires. With Sessions, the server fetches the user from the database on every request, ensuring the data is **always 100% up to date**.

### Where is Session Auth used?
*   **Highly secure applications:** Banking, healthcare, and enterprise software almost exclusively use stateful sessions because the ability to instantly kill a session is a strict security requirement.
*   **Traditional Web Apps:** Monolithic applications (like Ruby on Rails, Django, or standard Node/Express apps) where the backend and frontend are tightly coupled.
*   **Anywhere you need strict control:** If you need to limit users to 1 concurrent device, or force logouts on password changes, sessions are the way to go.

---

## 🚀 How to Run This Project

### 1. Start the Database
Make sure Docker is running, then start the PostgreSQL container:
```bash
docker compose up -d
```

### 2. Environment Variables
Ensure you have a `.env` file in this directory with your database connection string:
```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password
DATABASE_URL=postgres://postgres:your_password@localhost:5432/authentication_session
```

### 3. Install Dependencies & Migrate
```bash
pnpm install
pnpm db:push  # Pushes the Drizzle schema to your Postgres database
```

### 4. Start the Server
```bash
pnpm dev
```
The server will start on `http://localhost:8000`. You can now use Postman or Thunder Client to test the `/signup`, `/login`, and `/` routes!