import {NextFunction, Request, RequestHandler, Response} from "express";
import categoryService from "../service/category-service";
import {CreateCategoryRequest, SearchCategoryRequest, UpdateCategoryRequest} from "../model/category-model";

const create = async (req: Request<{}, {}, CreateCategoryRequest>, res: Response, next: NextFunction): Promise<void> => {
    try {
        const result = await categoryService.create(req.body);
        res.status(201).json({
            data: result,
        });
    } catch (e) {
        next(e);
    }
}

const get = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const id = Number(req.params.id);
        const result = await categoryService.get(id)
        res.status(200).json({
            data: result,
        })
    } catch (e) {
        next(e);
    }
}

const update = async (
    req: Request<{ id: string }, {}, UpdateCategoryRequest>,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const id = Number(req.params.id);
        const request = req.body;
        request.id = id

        const result = await categoryService.update(request)
        res.status(200).json({
            data: result,
        })
    } catch (e) {
        next(e);
    }
}

const remove: RequestHandler = async (req, res, next
): Promise<void> => {
    try {
        const id = Number(req.params.id);
        const result = await categoryService.remove(id);
        res.status(200).json({
            data: result,
        })
    } catch (e) {
        next(e);
    }
}

const search: RequestHandler = async (req, res, next) => {
    try {
        const request: SearchCategoryRequest = {
            name: req.query.name as string | undefined,
            description: req.query.description as string | undefined,
            page: req.query.page ? Number(req.query.page) : 1,
            size: req.query.size ? Number(req.query.size) : 10,
        };
        const result = await categoryService.search(request);
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