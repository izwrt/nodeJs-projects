import "dotenv/config";
import db from "./db/index.js";
import express from "express";
import bookRouter from "./Routes/book.routes.js"
import authorRouter from "./Routes/author.routes.js"

import {loggerMiddlerware} from './middleware/logger.js'

const app = express();
const PORT: number = 8000;

//Json parsing
app.use(express.json());

//logging middleware
app.use(loggerMiddlerware);

// Routes
app.use('/books', bookRouter)

app.use('/author', authorRouter);

app.listen(PORT, () => {
  console.log(`HTTP Server is running on PORT ${PORT}`);
});


