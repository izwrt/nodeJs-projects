// import express from "express";
// import bookRouter from "./Routes/book.routes.js"
// import {loggerMiddlerware} from './middleware/logger.js'

// const app = express();
// const PORT: number = 8000;

// //Json parsing
// app.use(express.json());

// //logging middleware
// app.use(loggerMiddlerware);

// // Routes
// app.use('/books', bookRouter)

// app.listen(PORT, () => {
//   console.log(`HTTP Server is running on PORT ${PORT}`);
// });

import "dotenv/config";
import db from "./db/index.js";
import { userTable } from "./drizzle/schema.js";

// async function getAlluser() {
//  const users = await db.select().from(userTable)
//  console.log('users', users);
// return users;
// }

// getAlluser();

const interUser = async() => {
    try{
    const user = await db.insert(userTable).values({
        id: 2,
        name: "Ishwar",
        email: "ishwar.tumalsherawt@gamil.com",
    }).returning();
    console.log('user', user);
} catch (error) {
    console.log('error', error);
}
}

interUser();