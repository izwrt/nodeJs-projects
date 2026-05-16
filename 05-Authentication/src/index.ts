import express from "express"
import type {Request, Response} from "express"

const app = express();
const PORT = 8000

app.use(express.json());

// Sign up - basically collecting data from the user to authenticate in the future
app.post("/sign-up", (req: Request, res: Response) => {
  
})

app.listen(PORT, () => {
  console.log(`Server is running on PORT ${PORT}`);
});
