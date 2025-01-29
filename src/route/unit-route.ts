import express from "express";
import {roleMiddleware} from "../middleware/role-middleware";
import unitController from "../controller/unit-controller";

export const unitRouter = () => {
    const router = express.Router();

    router.post('/units', roleMiddleware(['SUPERADMIN']), unitController.create);
    router.get('/units/:id', roleMiddleware(['SUPERADMIN']), unitController.get);
    router.put('/units/:id', roleMiddleware(['SUPERADMIN']), unitController.update);
    router.delete('/units/:id', roleMiddleware(['SUPERADMIN']), unitController.remove);
    router.get('/units', roleMiddleware(['SUPERADMIN']), unitController.search);

    return router;
}

