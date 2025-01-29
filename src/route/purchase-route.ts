import express from "express";
import {roleMiddleware} from "../middleware/role-middleware";
import purchaseController from "../controller/purchase-controller";


export const purchaseRouter = () => {
    const router = express.Router();

    router.post('/purchases', roleMiddleware(['SUPERADMIN', 'PRAMUNIAGA']), purchaseController.create)
    router.get('/purchases/:id', roleMiddleware(['SUPERADMIN', 'PRAMUNIAGA']), purchaseController.get)
    router.get('/purchases', roleMiddleware(['SUPERADMIN', 'PRAMUNIAGA']), purchaseController.search)

    return router;
}