import jsonWebToken, {JwtPayload, SignOptions} from 'jsonwebtoken';
import 'dotenv/config';
import {logger} from "./logging";

interface UserPayload {
    id: number;
}

const generateAccessToken = (user: UserPayload): string => {
    const payload: JwtPayload = {id: user.id};
    return jsonWebToken.sign(payload, process.env.JWT_SECRET as string, {
        expiresIn: process.env.JWT_EXPIRES_IN || '1800s',
    } as SignOptions);
};

const verifyAccessToken = (token: string): JwtPayload | null => {
    try {
        return jsonWebToken.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
    } catch (error) {
        logger.error(`Access token verification failed: ${(error as Error).message}`);
        return null;
    }
};

const generateRefreshToken = (user: UserPayload): string => {
    const payload: JwtPayload = {id: user.id};
    return jsonWebToken.sign(payload, process.env.JWT_REFRESH_SECRET as string, {
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '86400s',
    } as SignOptions);
};

const verifyRefreshToken = (token: string): JwtPayload | null => {
    try {
        return jsonWebToken.verify(token, process.env.JWT_REFRESH_SECRET as string) as JwtPayload;
    } catch (error) {
        logger.error(`Refresh token verification failed: ${(error as Error).message}`);
        return null;
    }
};

const parseJWT = (token: string): JwtPayload | null => {
    try {
        return jsonWebToken.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
    } catch (error) {
        logger.error(`JWT parsing failed: ${(error as Error).message}`);
        return null;
    }
};

export {
    generateAccessToken,
    generateRefreshToken,
    verifyRefreshToken,
    parseJWT,
    verifyAccessToken,
};
