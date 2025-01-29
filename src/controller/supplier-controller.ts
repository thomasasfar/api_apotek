import {Request, Response, NextFunction, RequestHandler} from "express";
import {CreateSupplierRequest, SearchSupplierRequest, UpdateSupplierRequest} from "../model/supplier-model";
import supplierService from "../service/supplier-service";

const create: RequestHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const request: CreateSupplierRequest = req.body
        const result = await supplierService.create(request);
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
        const result = await supplierService.get(id)
        res.status(200).json({
            data: result,
        })
    } catch (e) {
        next(e);
    }
}

const update: RequestHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const id = Number(req.params.id);
        const request: UpdateSupplierRequest = req.body;
        request.id = id

        const result = await supplierService.update(request)
        res.status(200).json({
            data: result,
        })
    } catch (e) {
        next(e);
    }
}

const remove = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const id = Number(req.params.id);
        const result = await supplierService.remove(id);
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
            code: req.query.code,
            address: req.query.address,
            phone: req.query.phone,
            email: req.query.email,
            npwp: req.query.npwp,
            page: req.query.page ? Number(req.query.page) : 1,
            size: req.query.size ? Number(req.query.size) : 10,
        } as SearchSupplierRequest;
        const result = await supplierService.search(request);
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