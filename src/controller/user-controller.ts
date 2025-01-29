import {Request, Response, NextFunction, RequestHandler} from "express";
import userService from "../service/user-service";
import {CreateUserRequest, LoginRequest, SearchUserRequest} from "../model/user-model";

const createUser: RequestHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const request: CreateUserRequest = req.body;
        const result = await userService.createUser(request);
        res.status(201).json({
            data: result,
        });
    } catch (e) {
        next(e);
    }
};

const login: RequestHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const request: LoginRequest = req.body;
        const result = await userService.login(request);
        res.status(200).json({
            data: result,
        });
    } catch (e) {
        next(e);
    }
};

const getCurrentUser: RequestHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const id = Number(req.user?.id);

        const result = await userService.getCurrentUser(id);
        res.status(200).json({
            data: result,
        });
    } catch (e) {
        next(e);
    }
};

const searchUser: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const request: SearchUserRequest = {
            name: req.query.name,
            username: req.query.username,
            role: req.query.role,
            page: req.query.page ? Number(req.query.page) : 1,
            size: req.query.size ? Number(req.query.size) : 10,
        } as SearchUserRequest;

        const result = await userService.searchUser(request);

        res.status(200).json({
            data: result.data,
            paging: result.paging,
        });

    } catch (e) {
        next(e);
    }
};

export default {createUser, login, getCurrentUser, searchUser};
