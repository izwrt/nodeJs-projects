import express from "express";
import "dotenv/config";
import { connectMongoDB } from "./connection.js";
import router from "./routes/user.routes.js";
import { authenticate } from "./middleware/auth.middleware.js";

const app = express();
const PORT = process.env.PORT ?? 8000;

app.use(express.json());

app.use(authenticate);
app.use('/api/user',router);

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
