import express from "express";
import {roleMiddleware} from "../middleware/role-middleware";
import productController from "../controller/product-controller";


export const productRouter = () => {
    const router = express.Router();

    router.post('/products', roleMiddleware(['SUPERADMIN']), productController.create);
    router.get('/products/:id', roleMiddleware(['SUPERADMIN']), productController.get);
    router.delete('/products/:id', roleMiddleware(['SUPERADMIN']), productController.remove);
    router.put('/products/:id', roleMiddleware(['SUPERADMIN']), productController.update);
    router.get('/products', roleMiddleware(['SUPERADMIN']), productController.search);

    return router;
}
