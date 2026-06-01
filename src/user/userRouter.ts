import express, { type Router } from "express";
import { registerUser, loginUser } from "./userController.ts";

const userRouter: Router = express.Router();

userRouter.post("/register", registerUser)
userRouter.post("/login", loginUser)

export default userRouter;