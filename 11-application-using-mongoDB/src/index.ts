import express from "express";
import "dotenv/config";
import { connectMongoDB } from "./connection.js";
import router from "./routes/user.routes.js";
import { authenticate } from "./middleware/auth.middleware.js";

const app = express();
const PORT = process.env.PORT ?? 8000;

// 1. Global Middleware
app.use(express.json());

// Run authentication globally to decode JWTs if present.
// This does NOT block requests, it only sets req.user.
app.use(authenticate);

// 2. Routes
app.use('/api/user',router);

// 3. Database Connection & Server Start
// We use async/await (via .then) to ensure the server only starts
// IF the database connection is successful (Fail-Fast architecture).
connectMongoDB(process.env.MONGODB_URL!)
  .then(() => {
    console.log(`MongoDB Connected`);

    app.listen(PORT, () => {
      console.log(`Server is running on PORT ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB", err);
    process.exit(1);
  });
