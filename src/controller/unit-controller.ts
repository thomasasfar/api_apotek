import {NextFunction, Request, RequestHandler, Response} from "express";
import {CreateUnitRequest, SearchUnitRequest, UpdateUnitRequest} from "../model/unit-model";
import unitService from "../service/unit-service";

const create: RequestHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const request: CreateUnitRequest = req.body
        const result = await unitService.create(request);
        res.status(201).json({
            data: result,
        });
    } catch (e) {
        next(e);
    }
}

const get: RequestHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const id = Number(req.params.id);
        const result = await unitService.get(id)
        res.status(200).json({
            data: result,
        })
    } catch (e) {
        next(e);
    }
}

const update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const id = Number(req.params.id);
        const request: UpdateUnitRequest = req.body;
        request.id = id

        const result = await unitService.update(request)
        res.status(200).json({
            data: result,
        })
    } catch (e) {
        next(e);
    }
}

const remove = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const id = Number(req.params.id)
        const result = await unitService.remove(id);
        res.status(200).json({
            data: result,
        })
    } catch (e) {
        next(e);
    }
}

const search = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const request = {
            name: req.query.name,
            page: req.query.page ? Number(req.query.page) : 1,
            size: req.query.size ? Number(req.query.size) : 10,
        } as SearchUnitRequest;
        const result = await unitService.search(request);
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