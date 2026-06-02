# 10 - Role-Based Access Control (RBAC) with JWT

This project builds upon stateless JWT authentication by introducing **Role-Based Access Control (RBAC)**. It demonstrates how to restrict access to certain routes based on a user's role (e.g., `USER` vs. `ADMIN`).

## 🧠 Core Concepts

### Authentication vs. Authorization
*   **Authentication (AuthN):** "Who are you?" (Verifying identity via email/password and issuing a JWT).
*   **Authorization (AuthZ):** "What are you allowed to do?" (Checking if the authenticated user has the `ADMIN` role to access a specific resource).

### The Security Analogy
We structured our middleware in three distinct layers, similar to physical building security:

1.  **`authenticate` (The Security Camera):** Runs globally on all requests. It looks at the `Authorization` header. If a valid token is found, it identifies the person (`req.user = payload`). It **does not** block anyone.
2.  **`ensureAuthenticated` (The Security Guard):** Placed only on protected routes. It checks if the person was identified by the camera (`if (!req.user)`). If not, it blocks them with a `401 Unauthorized`.
3.  **`requireAdmin` (The VIP Bouncer):** Placed only on admin routes. It checks the person's badge/role (`if (req.user.role !== "ADMIN")`). If they are just a regular user, it blocks them with a `403 Forbidden`.

## 🏗️ Architecture & Implementation

### 1. Database Schema (PostgreSQL Enums)
We use a PostgreSQL `ENUM` to strictly enforce roles at the database level. This ensures data integrity—no one can accidentally be assigned a role of `"SUPERUSER"` or `"hacker"`.

```typescript
export const roleEnum = pgEnum("role", ["USER", "ADMIN"]);

export const usersTable = pgTable("user", {
  // ... other fields
  role: roleEnum("role").notNull().default("USER"),
});
```

### 2. JWT Payload
When a user logs in, their role is embedded directly into the JWT payload. Because the token is cryptographically signed, the user cannot tamper with it to elevate their own privileges.

```json
{
  "id": "uuid-1234",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "ADMIN",
  "iat": 1717320000
}
```

### 3. Middleware Pipeline
Protected routes use a clean, readable middleware pipeline:

```typescript
// Admin Route Example
adminRouter.get("/users", ensureAuthenticated, requireAdmin, async (req, res) => {
    // If code reaches here, we are 100% sure the user is logged in AND is an admin.
    const users = await db.select().from(usersTable);
    res.json({ status: "Success", data: users });
});
```

## 🚀 How to Run

1. **Start the Database:**
   ```bash
   docker compose up -d
   ```

2. **Install Dependencies:**
   ```bash
   pnpm install
   ```

3. **Push the Schema to the Database:**
   ```bash
   pnpm run db:push
   ```

4. **Start the Development Server:**
   ```bash
   pnpm run dev
   ```

## 🧪 Testing the Flow (Postman / Thunder Client)

1. **Signup as a normal user:**
   * `POST /signup` with `{ "name": "User", "email": "user@test.com", "password": "password123" }` (Role defaults to `USER`).
2. **Signup as an admin:**
   * `POST /signup` with `{ "name": "Admin", "email": "admin@test.com", "password": "password123", "role": "ADMIN" }`.
3. **Login:**
   * `POST /login` with either account to get a JWT.
4. **Access Profile (`GET /`):**
   * Pass the token in the `Authorization: Bearer <token>` header. Both users can access this.
5. **Access Admin Route (`GET /admin/users`):**
   * Pass the normal user token -> Returns `403 Forbidden`.
   * Pass the admin token -> Returns `200 OK` with the list of users.
