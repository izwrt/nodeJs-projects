import express from "express";
import "dotenv/config";
import { connectMongoDB } from "./connection.js";

const app = express();
app.use(express.json());

const PORT = process.env.PORT ?? 8000;

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
