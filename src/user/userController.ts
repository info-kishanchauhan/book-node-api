import { type NextFunction, type Request, type Response } from "express";
import { validateRegisterUser, validateLoginUser } from "../validation/userValidation.ts";
import createHttpError from "http-errors";
import userModel, { type UserInterface } from "./userModel.ts";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { config } from "../config/config.ts";

export const registerUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    let input = req.body;
    let inputError: any = validateRegisterUser(input);
    if (inputError) {
        inputError = createHttpError(422, "All fields are required.", { details: inputError });
        return next(inputError)
    }

    try {
        const user = await userModel.findOne({ email: input.email });
        if (user) {
            return next(createHttpError(409, "This email is already registered with us. Please use a different email.", { details: { email: "This email is already registered with us. Please use a different email." } }));
        }
    } catch (err) {
        return next(createHttpError(500, "Error while getting user.", { details: err ?? null }));
    }

    let createUser: UserInterface;
    try {

        const hashPassword = await bcrypt.hash(input.password, 10);

        createUser = await userModel.create({
            name: input.name,
            email: input.email,
            password: hashPassword,
        })
    } catch (err) {
        return next(createHttpError(500, "Error while creating user.", { details: err ?? null }));
    }

    try {
        const token = jwt.sign({ sub: createUser?._id }, config.JWT_SECRET as string, { expiresIn: config.JWT_EXPIRES_IN as string });

        res.status(201).json({ msg: 'User registered successfully.', accessToken: token });
    } catch (err) {
        return next(createHttpError(500, "Error while sign in token.", { details: err ?? null }));
    }
}


export const loginUser = async (req: Request, res: Response, next: NextFunction) => {
    let input = req.body;
    let inputError: any = validateLoginUser(input);

    if (inputError) {
        inputError = createHttpError(422, "All fields are required.", { details: inputError });
        return next(inputError)
    }

    let user: UserInterface;
    try {
        user = await userModel.findOne({ email: input.email });

        if (!user) {
            return next(createHttpError(404, "User not found.", { details: { email: "User not found." } }));
        }
    } catch (err) {
        return next(createHttpError(500, "Error while getting user.", { details: err ?? null }));
    }

    const isMatch = bcrypt.compare(input.password, user.password)
    if (!isMatch) {
        return next(createHttpError(401, "Invalid password.", { details: { password: "Invalid password." } }));
    }

    const token = jwt.sign({ sub: user._id }, config.JWT_SECRET as string, { expiresIn: config.JWT_EXPIRES_IN as string })

    res.status(200).json({ msg: 'User logged in successfully.', accessToken: token })
}