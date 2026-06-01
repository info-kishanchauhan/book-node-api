import express from "express";
import cors from "cors";
import ExceptionHandler from "./middleware/ExceptionHandler.ts";
import userRouter from "./user/userRouter.ts";
import bookRouter from "./book/bookRouter.ts"
import { config } from "./config/config.ts";

const app = express();

app.use(cors({
    origin: config.FRONTEND_URL,
    credentials: true
}));
// routes
app.use(express.json());
app.use("/api/auth", userRouter);
app.use("/api/books", bookRouter);
app.use(ExceptionHandler);

export default app;