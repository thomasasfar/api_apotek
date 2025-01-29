import {Request, Response, NextFunction, RequestHandler} from 'express';
import {CreateProductRequest, SearchProductRequest, UpdateProductRequest} from "../model/product-model";
import productService from "../service/product-service";

const create: RequestHandler = async (
    req: Request<{}, {}, CreateProductRequest>, res: Response, next: NextFunction
): Promise<void> => {
    try {
        const result = await productService.create(req.body);
        res.status(201).json({
            data: result,
        })
    } catch (e) {
        next(e);
    }
}

const get: RequestHandler = async (
    req: Request, res: Response, next: NextFunction
): Promise<void> => {
    try {
        const id = Number(req.params.id);
        const result = await productService.get(id);
        res.status(200).json({
            data: result,
        })
    } catch (e) {
        next(e);
    }
}

const remove: RequestHandler = async (
    req: Request, res: Response, next: NextFunction
): Promise<void> => {
    try {
        const id = Number(req.params.id);
        const result = await productService.remove(id);
        res.status(200).json({
            data: result,
        })
    } catch (e) {
        next(e);
    }
}

const update: RequestHandler = async (
    req: Request, res: Response, next: NextFunction
): Promise<void> => {
    try {
        const id = Number(req.params.id)
        const request: UpdateProductRequest = req.body
        request.id = id

        const result = await productService.update(request)
        res.status(200).json({
            data: result,
        })
    } catch (e) {
        next(e);
    }
}

const search: RequestHandler = async (
    req: Request, res: Response, next: NextFunction
): Promise<void> => {
    try {
        const request = {
            code: req.query.code,
            name: req.query.name,
            category_id: req.query.category_id,
            group_id: req.query.group_id,
            minimum_stock: req.query.minimum_stock,
            allow_sale_before_expired: req.query.allow_sale_before_expired,
            page: req.query.page ? Number(req.query.page) : 1,
            size: req.query.size ? Number(req.query.size) : 10,
        } as SearchProductRequest;

        const result = await productService.search(request)
        res.status(200).json({
            data: result.data,
            paging: result.paging
        })
    } catch (e) {
        next(e);
    }
}

export default {
    create,
    get,
    remove,
    update,
    search
}

