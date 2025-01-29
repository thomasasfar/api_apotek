import express from 'express';
import {roleMiddleware} from "../middleware/role-middleware";
import supplierController from "../controller/supplier-controller";


export const supplierRouter = () => {
    const router = express.Router();

    router.post('/suppliers', roleMiddleware(['SUPERADMIN']), supplierController.create);
    router.put('/suppliers/:id', roleMiddleware(['SUPERADMIN']), supplierController.update);
    router.get('/suppliers/:id', roleMiddleware(['SUPERADMIN']), supplierController.get);
    router.delete('/suppliers/:id', roleMiddleware(['SUPERADMIN']), supplierController.remove);
    router.get('/suppliers', roleMiddleware(['SUPERADMIN']), supplierController.search);

    return router;

}