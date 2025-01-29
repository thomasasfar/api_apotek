import {ResponseError} from "../error/response-error";
import multer from "multer";
import {Request, Response, NextFunction} from "express";

const errorMiddleware = async (
    err: unknown,
    _req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    if (!err) {
        next();
        return;
    }

    if (err instanceof ResponseError) {
        res.status(err.status).json({
            errors: err.message
        }).end();
    } else if (err instanceof multer.MulterError) {
        res.status(400).json({
            errors: err.message
        });
    } else if (err instanceof Error) {
        res.status(500).json({
            errors: err.message
        }).end();
    } else {
        res.status(500).json({
            errors: "An unknown error occurred"
        }).end();
    }
};

export {errorMiddleware};
