import {Request, Response, NextFunction, RequestHandler} from "express";
import {CreateSaleRequest, SearchSaleRequest} from "../model/sale-model";
import saleService from "../service/sale-service";

const create: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const userId = Number(req.user?.id);
        const request: CreateSaleRequest = req.body
        request.user_id = userId;

        const result = await saleService.create(request);
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
        const id = Number(req.params.id)
        const result = await saleService.get(id)

        res.status(200).json({
            data: result,
        })
    } catch (e) {
        next(e);
    }
}

const search = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const request = {
            user_id: req.query.user_id ? Number(req.query.user_id) : null,
            month: req.query.month ? String(req.query.month) : null,
            date_range: req.query.start_date && req.query.end_date
                ? {
                    start_date: new Date(String(req.query.start_date)),
                    end_date: new Date(String(req.query.end_date)),
                }
                : null,
            page: req.query.page ? Number(req.query.page) : 1,
            size: req.query.size ? Number(req.query.size) : 10,
        } as SearchSaleRequest;

        const result = await saleService.search(request);
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
    search
};