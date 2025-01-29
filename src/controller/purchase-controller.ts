import {NextFunction, Request, RequestHandler, Response} from "express";
import {CreatePurchaseRequest, SearchPurchaseRequest} from "../model/purchase-model";
import purchaseService from "../service/purchase-service";

const create: RequestHandler = async (
    req: Request<{}, {}, CreatePurchaseRequest>,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const userId = Number(req.user?.id)
        const request = req.body as CreatePurchaseRequest;
        request.user_id = userId;
        const result = await purchaseService.create(request);
        res.status(201).json({
            data: result,
        })
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
        const result = await purchaseService.get(id);
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
            code: req.query.code,
            user_id: req.query.user_id,
            supplier_id: req.query.supplier_id,
            month: req.query.month,
            page: req.query.page ? Number(req.query.page) : 1,
            size: req.query.size ? Number(req.query.size) : 10,
        } as SearchPurchaseRequest;

        const result = await purchaseService.search(request);
        res.status(200).json({
            data: result.data,
            paging: result.paging,
        })
    } catch (e) {
        next(e);
    }
}

export default {
    create,
    get,
    search
}