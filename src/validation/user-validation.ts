import Joi, {Schema} from "joi";
import {Roles} from "@prisma/client";


const createUserValidation: Schema = Joi.object({
    username: Joi.string().max(40).required(),
    name: Joi.string().max(40).required(),
    password: Joi.string().min(6).max(40).required(),
    role: Joi.valid(Roles.SUPERADMIN, Roles.TTF, Roles.APOTEKER, Roles.PRAMUNIAGA).required()
});

const loginValidation: Schema = Joi.object({
    username: Joi.string().max(40).required(),
    password: Joi.string().max(40).required(),
});

const currentUserValidation: Schema = Joi.number().required().positive();

const searchUserValidation: Schema = Joi.object({
    page: Joi.number().min(1).positive().default(1),
    size: Joi.number().min(1).positive().max(100).default(10),
    name: Joi.string().optional(),
    username: Joi.string().optional(),
    role: Joi.valid(Roles.SUPERADMIN, Roles.TTF, Roles.APOTEKER, Roles.PRAMUNIAGA).optional()
});

export {
    createUserValidation,
    loginValidation,
    currentUserValidation,
    searchUserValidation,
};
