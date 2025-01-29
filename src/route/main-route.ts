import express from "express";
import userController from "../controller/user-controller";
import {authMiddleware} from "../middleware/auth-middleware";
import {userRouter} from "./user-route";
import {supplierRouter} from "./supplier-route";
import {categoryRouter} from "./category-route";
import {unitRouter} from "./unit-route";
import {groupRouter} from "./group-route";
import {productRouter} from "./product-route";
import {purchaseRouter} from "./purchase-route";
import {stockRouter} from "./stock-route";
import {saleRouter} from "./sale-route";

const mainRouter = express.Router();

const routers = [
    purchaseRouter(),
    userRouter(),
    supplierRouter(),
    categoryRouter(),
    unitRouter(),
    groupRouter(),
    productRouter(),
    stockRouter(),
    saleRouter()
]

mainRouter.post('/api/users/login', userController.login);
mainRouter.use(authMiddleware as express.RequestHandler);

routers.forEach((router) => mainRouter.use('/api', router));

export default mainRouter;