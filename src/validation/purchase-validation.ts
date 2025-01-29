import Joi, {Schema} from "joi";

const detailPurchaseValidation: Schema = Joi.object({
    product_id: Joi.number().required().positive().label('ID Produk'),
    product_unit_id: Joi.number().required().positive().label('ID Satuan Produk'),
    amount: Joi.number().positive().required().label('Jumlah'),
    batch_number: Joi.string().optional().allow('').label('No Batch'),
    expired_date: Joi.date().required().label('Tanggal Expired'),
    price: Joi.number().positive().required().label('Harga'),
})

const createPurchaseValidation: Schema = Joi.object({
    code: Joi.string().required().label('No Faktur'),
    supplier_id: Joi.number().required().positive(),
    user_id: Joi.number().required().positive(),
    purchase_date: Joi.date().required().label('Tanggal Pembelian'),
    note: Joi.string().optional().allow('').label('Catatan'),
    items: Joi.array()
        .items(detailPurchaseValidation)
        .min(1)
        .required()
        .label('Daftar Produk'),
});

const getPurchaseValidation: Schema = Joi.number().required().positive();

const searchPurchaseValidation: Schema = Joi.object({
    page: Joi.number().min(1).positive().default(1),
    size: Joi.number().min(1).positive().default(10),
    code: Joi.string().optional(),
    supplier_id: Joi.number().optional(),
    user_id: Joi.number().optional(),
    month: Joi.string()
        .pattern(/^\d{4}-(?:[1-9]|1[0-2])$/)  // Format "YYYY-M"
        .optional()
        .messages({
            'string.pattern.base': 'Purchase date must be in format YYYY-M (example: 2024-1)'
        })
});

export {
    createPurchaseValidation,
    getPurchaseValidation,
    searchPurchaseValidation
};