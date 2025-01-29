import express from "express";
import {errorMiddleware} from "../middleware/error-middleware";
import mainRouter from "../route/main-route";

export const web = express();
web.use(express.json());

web.use(mainRouter);

web.use(errorMiddleware);