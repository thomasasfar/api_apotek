import Joi, {Schema} from "joi";

const createSupplierValidation: Schema = Joi.object({
    name: Joi.string().required().max(255),
    address: Joi.string().optional().allow(''),
    phone: Joi.string().optional().max(20).allow(''),
    email: Joi.string().email().optional().allow(''),
    npwp: Joi.string().optional().max(20).allow(''),
});

const updateSupplierValidation: Schema = Joi.object({
    id: Joi.number().required().positive(),
    name: Joi.string().required().max(255),
    address: Joi.string().optional().allow(''),
    phone: Joi.string().optional().allow('').max(20),
    email: Joi.string().email().optional().allow(''),
    npwp: Joi.string().optional().max(20).allow(''),
});

const getSupplierValidation: Schema = Joi.number().required().positive();

const searchSupplierValidation: Schema = Joi.object({
    page: Joi.number().min(1).positive().default(1),
    size: Joi.number().min(1).positive().default(10),
    name: Joi.string().optional(),
    code: Joi.string().optional(),
    address: Joi.string().optional(),
    phone: Joi.string().optional(),
    email: Joi.string().optional(),
    npwp: Joi.string().optional(),
});

export {
    createSupplierValidation,
    updateSupplierValidation,
    getSupplierValidation,
    searchSupplierValidation
};