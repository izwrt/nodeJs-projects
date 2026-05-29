# 🔐 JWT Authentication (The Stateless Way)

Welcome to the **09-authentication-jwt** project! This module is a deep dive into building a robust, production-grade, **stateless** authentication system from scratch using Node.js, Express, TypeScript, PostgreSQL, Drizzle ORM, and JSON Web Tokens (JWT).

Instead of relying on database lookups for every request, this project demonstrates how to securely issue and verify cryptographically signed tokens to authenticate users.

---

## 🛠️ What We Built

In this project, we implemented a complete JWT authentication pipeline:

1. **Secure Signup (`POST /signup`):** 
   - Takes user credentials and generates a cryptographically secure random `salt`.
   - Hashes the password using `HMAC-SHA256` combined with the salt.
   - Saves the user safely to the PostgreSQL database.
2. **Stateless Login (`POST /login`):** 
   - Verifies the user's password against the stored hash.
   - Generates a **JSON Web Token (JWT)** containing the user's `id`, `name`, and `email`.
   - Cryptographically signs the token using a secret `JWT_SECRET`.
   - Returns the token to the client.
3. **Protected Routes (`GET /`):** 
   - Uses custom Express middleware to intercept incoming requests.
   - Reads the `Authorization: Bearer <token>` header.
   - Verifies the token's signature using the server's secret key.
   - Decodes the payload and attaches the `user` object directly to the Express `req` object, **without querying the database**.

---

## 🧠 Deep Dive: How JWT Authentication Works

Imagine a highly exclusive VIP club. 

When you arrive at the club for the first time (Login), you show your ID and password. The bouncer verifies who you are. Instead of writing your name on a clipboard, the bouncer hands you a **VIP Badge** that has your name printed on it. The bouncer then stamps the badge with an **unforgeable wax seal** (the cryptographic signature).

* The **VIP Badge** is the JWT.
* The **Wax Seal** is the signature created using your server's `JWT_SECRET`.

Every time you want to enter a room in the club (make an API request), you show your badge. The bouncer doesn't need to look at a clipboard or call the front desk. They just look at the wax seal. If the seal is unbroken and authentic, they trust the name printed on the badge and let you in.

### The Technical Flow:
1. Client sends `email` and `password`.
2. Server verifies credentials against the database.
3. Server creates a JSON object (Payload): `{ id: "123", email: "a@a.com" }`.
4. Server signs this payload using a secret key, creating a JWT.
5. Server sends the JWT back to the client.
6. Client stores this token (usually in `localStorage` or memory).
7. On the next request, the client sends the token in the `Authorization` header.
8. Server mathematically verifies the signature. If valid, the user is authenticated!

---

## 🏛️ What does "Stateless" mean?

JWT authentication is a **Stateless** architecture. 

**"Stateless" means the server has no memory of who is logged in.** The server does not store active sessions in a database or Redis. The token itself contains all the information needed to authenticate the user. 

Because the server doesn't need to do a database lookup on every single request, stateless authentication is incredibly fast and highly scalable.

---

## ⚔️ The Great Debate: JWT (Stateless) vs. Sessions (Stateful)

If you've built traditional web apps, you've likely used **Session-based auth**. In a session system, the bouncer *does* have a clipboard (a database table), and they check it every time you move.

### Why use JWTs instead of Sessions?

#### 1. Infinite Scalability (Microservices)
If you have 10 different backend servers (e.g., a User Service, an Order Service, a Payment Service), a session-based system requires all 10 servers to talk to the same shared database to check if a user is logged in. 
With JWT, **any server that knows the secret key can verify the token independently.** The Order Service doesn't need to talk to the User Service; it just checks the math on the token's signature. This is why JWTs are the industry standard for Microservice architectures.

#### 2. Zero Database Lookups
Because the token contains the user's ID and email, the server doesn't need to query the database to figure out who is making the request. This saves a massive amount of database load, especially on high-traffic APIs.

#### 3. Cross-Domain (CORS) Friendly
Cookies (used in sessions) are tied to a specific domain (like `api.yoursite.com`). If your frontend is on a mobile app, or a completely different domain, managing cookies becomes a nightmare. JWTs are just strings sent in the `Authorization` header, making them work effortlessly across web, iOS, Android, and third-party APIs.

### The Tradeoffs (Why JWT isn't perfect)
*   **The Revocation Problem:** Because the server has no memory, you cannot easily "log a user out" or invalidate a specific token before it expires. If a hacker steals a JWT, it is valid until the expiration time hits.
*   **Stale Data:** If a user changes their email in the database, the JWT they are currently holding still contains the old email until they log in again and get a new token.

---

## 🚀 How to Run This Project

### 1. Start the Database
Make sure Docker is running, then start the PostgreSQL container:
```bash
docker compose up -d
```

### 2. Environment Variables
Ensure you have a `.env` file in this directory with your database connection string and a secure JWT secret:
```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password
DATABASE_URL=postgres://postgres:your_password@localhost:5432/authentication_jwt
# Generate a strong secret: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET=your_super_secret_random_string_here
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