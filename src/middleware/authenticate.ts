import type { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import jwt from "jsonwebtoken";
import { config } from '../config/config.ts';

export interface AuthRequest extends Request {
    userId: string;
}

const authenticate = (req: Request, res: Response, next: NextFunction) => {
    let token = req.header('Authorization');
    if (!token) {
        return next(createHttpError(401, "Authorization token is required."))
    }

    token = token.split(" ")[1];
    try {
        const decode: any = jwt.verify(token as string, config.JWT_SECRET as string)
        const _req = req as AuthRequest;

        _req.userId = decode.sub as string;

        next();
    } catch (err: any) {
        return next(createHttpError(401, "Invalid token."))
    }
}

export default authenticate;