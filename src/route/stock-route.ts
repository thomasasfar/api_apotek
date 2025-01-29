import express from "express";
import {roleMiddleware} from "../middleware/role-middleware";
import stockController from "../controller/stock-controller";

export const stockRouter = () => {
    const router = express.Router();

    router.get('/stocks', roleMiddleware(['SUPERADMIN']), stockController.search)

    return router;
}