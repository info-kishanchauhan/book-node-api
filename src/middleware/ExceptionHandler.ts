import type { HttpError } from "http-errors";
import { config } from "../config/config.ts";
import type { NextFunction, Request, Response } from "express";

export interface CustomHttpError extends HttpError {
    details?: any;
}

const ExceptionHandler = (
    err: CustomHttpError,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const statusCode = err.statusCode || 500;

    return res.status(statusCode).json({
        message: err.message,
        details: err.details, // Extracts custom object like validation errors
        errorStack: config.NODE_ENV === "development" ? err.stack : ""
    });
};

export default ExceptionHandler;