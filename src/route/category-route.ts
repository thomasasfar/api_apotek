import express from 'express'
import categoryController from "../controller/category-controller";
import {roleMiddleware} from "../middleware/role-middleware";

export const categoryRouter = () => {
    const router = express.Router();

    router.post('/categories', roleMiddleware(['SUPERADMIN']), categoryController.create);
    router.get('/categories/:id', roleMiddleware(['SUPERADMIN']), categoryController.get);
    router.put('/categories/:id', roleMiddleware(['SUPERADMIN']), categoryController.update);
    router.delete('/categories/:id', roleMiddleware(['SUPERADMIN']), categoryController.remove);
    router.get('/categories', roleMiddleware(['SUPERADMIN']), categoryController.search);

    return router;
}