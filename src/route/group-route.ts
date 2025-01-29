import express from "express";
import groupController from "../controller/group-controller";
import {roleMiddleware} from "../middleware/role-middleware";

export const groupRouter = () => {
    const router = express.Router();

    router.post('/groups', roleMiddleware(['SUPERADMIN']), groupController.create);
    router.get('/groups/:id', roleMiddleware(['SUPERADMIN']), groupController.get);
    router.put('/groups/:id', roleMiddleware(['SUPERADMIN']), groupController.update);
    router.delete('/groups/:id', roleMiddleware(['SUPERADMIN']), groupController.remove);
    router.get('/groups', roleMiddleware(['SUPERADMIN']), groupController.search);

    return router;
}
