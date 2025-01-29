import {Request, Response, NextFunction, RequestHandler} from "express";
import {SearchStockRequest} from "../model/stock-model";
import stockService from "../service/stock-service";

const search: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const request = {
            batch_number: req.query.batch_number,
            product: req.query.product,
            before_expired: req.query.before_expired,
            page: req.query.page ? Number(req.query.page) : 1,
            size: req.query.size ? Number(req.query.size) : 10,
        } as SearchStockRequest;

        const result = await stockService.search(request);
        res.status(200).json({
            data: result.data,
            paging: result.paging,
        })
    } catch (e) {
        next(e);
    }
}

export default {
    search,
}