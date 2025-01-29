import Joi, {Schema} from "joi";

const createCategoryValidation: Schema = Joi.object({
    name: Joi.string().required().max(100),
    description: Joi.string().optional().allow(''),
});

const getCategoryValidation: Schema = Joi.number().required().positive();

const updateCategoryValidation: Schema = Joi.object({
    id: Joi.number().required().positive(),
    name: Joi.string().max(100).required().label('Nama'),
    description: Joi.string().optional().allow('').label('Deskripsi'),
});

const searchCategoryValidation: Schema = Joi.object({
    page: Joi.number().min(1).positive().default(1),
    size: Joi.number().min(1).positive().default(10),
    name: Joi.string().optional(),
    description: Joi.string().optional(),
});

export {
    createCategoryValidation,
    getCategoryValidation,
    updateCategoryValidation,
    searchCategoryValidation
};