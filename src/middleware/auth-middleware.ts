import {verifyAccessToken} from "../application/jwt";
import {prismaClient} from "../application/database";
import {Request, Response, NextFunction} from "express";

export const authMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<Response | void> => {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            errors: 'Missing or invalid Authorization header',
        });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({
            errors: 'Token not provided',
        });
    }

    try {
        const decoded = verifyAccessToken(token);
        if (!decoded) {
            throw new Error('Invalid token');
        }

        const user = await prismaClient.user.findUnique({
            where: {id: decoded.id}
        });

        if (!user) {
            return res.status(401).json({
                errors: 'User not found',
            });
        }

        req.user = {
            id: user.id,
            role: user.role,
        };

        next();
    } catch (error) {
        return res.status(401).json({
            errors: (error as Error).message || 'Unauthorized',
        });
    }
};