import express from "express";
import {roleMiddleware} from "../middleware/role-middleware";
import saleController from "../controller/sale-controller";

export const saleRouter = () => {
    const router = express.Router();

    router.post('/sales', roleMiddleware(['SUPERADMIN', 'PRAMUNIAGA']), saleController.create)
    router.get('/sales/:id', roleMiddleware(['SUPERADMIN', 'PRAMUNIAGA']), saleController.get)
    router.get('/sales', roleMiddleware(['SUPERADMIN', 'PRAMUNIAGA']), saleController.search)

    return router;
}