import Joi from "joi";

const searchStockValidation = Joi.object({
    page: Joi.number().min(1).positive().default(1),
    size: Joi.number().min(1).positive().default(10),
    product: Joi.string().optional(),
    batch_number: Joi.string().optional(),
    before_expired: Joi.string().optional(),
});

export {
    searchStockValidation,
};