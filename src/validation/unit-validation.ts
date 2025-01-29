import Joi, {Schema} from "joi";

const createUnitValidation: Schema = Joi.object({
    name: Joi.string().required().max(30).label('Nama'),
});

const getUnitValidation: Schema = Joi.number().required().positive();

const updateUnitValidation: Schema = Joi.object({
    id: Joi.number().required().positive(),
    name: Joi.string().required().max(30).label('Nama'),
});

const searchUnitValidation: Schema = Joi.object({
    page: Joi.number().min(1).positive().default(1),
    size: Joi.number().min(1).positive().default(10),
    name: Joi.string().optional(),
});


export {
    createUnitValidation,
    getUnitValidation,
    updateUnitValidation,
    searchUnitValidation
};