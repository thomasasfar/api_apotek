import Joi, {Schema} from "joi";

const createSaleValidation: Schema = Joi.object({
    user_id: Joi.number().required().positive(),
    total_payment: Joi.number().required().positive(),
    items: Joi.array().items(
        Joi.object({
            product_id: Joi.number().required().positive(),
            quantity: Joi.number().required().positive(),
            product_unit_id: Joi.number().required().positive(),
        })
    )
        .required()
        .min(1)
})

const getSaleValidation: Schema = Joi.number().positive().required()

const searchSaleValidation: Schema = Joi.object({
    user_id: Joi.number().allow(null).optional(),
    month: Joi.string().allow(null).optional(),
    date_range: Joi.object({
        start_date: Joi.date().iso().required(),
        end_date: Joi.date().iso().min(Joi.ref('start_date')).required(),
    }).optional().allow(null),
    page: Joi.number().min(1).positive().default(1),
    size: Joi.number().min(1).positive().default(10),
});


export {
    createSaleValidation,
    getSaleValidation,
    searchSaleValidation
}