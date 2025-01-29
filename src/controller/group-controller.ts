import {NextFunction, Request, RequestHandler, Response} from "express";
import {CreateGroupRequest, SearchGroupRequest, UpdateGroupRequest} from "../model/group-model";
import groupService from "../service/group-service";

const create = async (req: Request<{}, {}, CreateGroupRequest>, res: Response, next: NextFunction): Promise<void> => {
    try {
        const result = await groupService.create(req.body);
        res.status(201).json({
            data: result,
        });
    } catch (e) {
        next(e);
    }
}

const get: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const id = Number(req.params.id);
        const result = await groupService.get(id)
        res.status(200).json({
            data: result,
        })
    } catch (e) {
        next(e);
    }
}

const update = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const id = Number(req.params.id);
        const request = req.body as UpdateGroupRequest;
        request.id = id

        const result = await groupService.update(request)
        res.status(200).json({
            data: result,
        })
    } catch (e) {
        next(e);
    }
}

const remove: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const id = Number(req.params.id);
        const result = await groupService.remove(id);
        res.status(200).json({
            data: result,
        })
    } catch (e) {
        next(e);
    }
}

const search: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const request = {
            name: req.query.name,
            description: req.query.description,
            page: req.query.page ? Number(req.query.page) : 1,
            size: req.query.size ? Number(req.query.size) : 10,
        } as SearchGroupRequest;
        const result = await groupService.search(request);
        res.status(200).json({
            data: result.data,
            paging: result.paging
        });
    } catch (e) {
        next(e);
    }
}

export default {
    create,
    get,
    update,
    remove,
    search,
}