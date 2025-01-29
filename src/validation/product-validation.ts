import Joi, {Schema} from "joi";

const productUnitValidation: Schema = Joi.object({
    unit_id: Joi.number().required().label('Unit ID'),
    price: Joi.number().required().label('Harga'),
    conversion_value: Joi.number().optional().positive().integer().allow(null).label('Nilai Konversi'),
    is_default: Joi.boolean().default(false).optional().label('Satuan Default'),
});

const createProductValidation: Schema = Joi.object({
    name: Joi.string().required().max(255).label('Nama'),
    code: Joi.string().required().max(255).label('Kode'),
    minimum_stock: Joi.number().required().label('Stok minimal'),
    allow_sale_before_expired: Joi.number().optional().label('Batas hari penjualan sebelum kadaluarsa'),
    description: Joi.string().optional().allow('').label('Deskripsi'),
    indication: Joi.string().optional().allow('').label('Indikasi'),
    contraindication: Joi.string().optional().allow('').label('Kontraindikasi'),
    side_effects: Joi.string().optional().allow('').label('Efek samping'),
    content: Joi.string().optional().allow('').label('Kandungan'),
    dose: Joi.string().optional().allow('').label('Dosis'),
    category_id: Joi.number().required().positive().required().label('Id Kategori'),
    group_id: Joi.number().required().positive().required().label('Id Golongan'),
    productUnits: Joi.array().items(productUnitValidation).min(1).required().label('Satuan'),
});

const getProductValidation: Schema = Joi.number().positive().required();

const updateProductValidation: Schema = Joi.object({
    id: Joi.number().required().positive(),
    name: Joi.string().required().max(255).label('Nama'),
    code: Joi.string().required().max(255).label('Kode'),
    minimum_stock: Joi.number().required().label('Stok minimal'),
    allow_sale_before_expired: Joi.number().optional().label('Batas hari penjualan sebelum kadaluarsa'),
    description: Joi.string().optional().allow('').label('Deskripsi'),
    indication: Joi.string().optional().allow('').label('Indikasi'),
    contraindication: Joi.string().optional().allow('').label('Kontraindikasi'),
    side_effects: Joi.string().optional().allow('').label('Efek samping'),
    content: Joi.string().optional().allow('').label('Kandungan'),
    dose: Joi.string().optional().allow('').label('Dosis'),
    category_id: Joi.number().required().positive().required().label('Id Kategori'),
    group_id: Joi.number().required().positive().required().label('Id Golongan'),
    productUnits: Joi.array().items(productUnitValidation).min(1).required().label('Satuan'),
});

const searchProductValidation: Schema = Joi.object({
    page: Joi.number().min(1).positive().default(1),
    size: Joi.number().min(1).positive().default(10),
    name: Joi.string().optional(),
    code: Joi.string().optional(),
    category_id: Joi.number().optional().positive(),
    group_id: Joi.number().optional().positive(),
    minimum_stock: Joi.number().optional().positive(),
    allow_sale_before_expired: Joi.number().optional().positive(),
});

export {
    createProductValidation,
    getProductValidation,
    updateProductValidation,
    searchProductValidation
};