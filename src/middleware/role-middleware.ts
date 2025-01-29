import {Request, Response, NextFunction, RequestHandler} from "express";
import {ResponseError} from "../error/response-error";

export const roleMiddleware = (requiredRoles: string[]): RequestHandler => {
    return (req: Request, res: Response, next: NextFunction): void => {
        const user = req.user;

        if (!user) {
            throw new ResponseError(401, 'Unauthorized: User data not found')
        }

        if (!requiredRoles.includes(user.role)) {
            throw new ResponseError(403, 'Forbidden: Insufficient permissions')
        }

        next();
    };
};
