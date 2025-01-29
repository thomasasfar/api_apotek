import Joi, {Schema} from "joi";

const createGroupValidation: Schema = Joi.object({
    name: Joi.string().required().max(100).label("Nama"),
    description: Joi.string().optional().allow(''),
});

const getGroupValidation: Schema = Joi.number().required().positive();

const updateGroupValidation: Schema = Joi.object({
    id: Joi.number().required().positive(),
    name: Joi.string().max(100).required().label('Nama'),
    description: Joi.string().optional().allow('').label('Deskripsi'),
});

const searchGroupValidation: Schema = Joi.object({
    page: Joi.number().min(1).positive().default(1),
    size: Joi.number().min(1).positive().default(10),
    name: Joi.string().optional(),
    description: Joi.string().optional(),
});

export {
    createGroupValidation,
    getGroupValidation,
    updateGroupValidation,
    searchGroupValidation
};