import express from 'express';
import userController from "../controller/user-controller";
import {roleMiddleware} from "../middleware/role-middleware";

export const userRouter = () => {
    const router = express.Router();

    router.post('/users', userController.createUser);
    router.get('/users/current', userController.getCurrentUser);

    router.get('/users', roleMiddleware(['SUPERADMIN']), userController.searchUser);

    return router;
}


