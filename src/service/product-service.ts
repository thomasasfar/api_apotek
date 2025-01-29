import {
    CreateProductRequest,
    ProductResponse,
    ProductWithUnits, SearchProductRequest, SearchProductResponse,
    toProductResponse, toSearchProductResponse,
    UpdateProductRequest
} from "../model/product-model";
import {validate} from "../validation/validation";
import {
    createProductValidation,
    getProductValidation,
    searchProductValidation,
    updateProductValidation
} from "../validation/product-validation";
import {prismaClient} from "../application/database";
import {ResponseError} from "../error/response-error";
import {buildFilters} from "../helpers/filter-helper";
import {FilterConfig, Pageable} from "../model/page-model";

const create = async (request: CreateProductRequest): Promise<ProductResponse> => {
    request = validate(createProductValidation, request);

    const productExist = await prismaClient.product.findFirst({
        where: {
            code: request.code
        },
    });

    if (productExist) {
        throw new ResponseError(400, "Produk dengan kode yang sama telah ada");
    }

    const unitIds = request.productUnits.map((unit) => unit.unit_id);
    const unitsExist = await prismaClient.unit.findMany({
        where: {
            id:
                {
                    in: unitIds
                }
        },
    });

    if (unitsExist.length !== request.productUnits.length) {
        throw new ResponseError(404, "Salah satu unit tidak ditemukan");
    }

    // Validate default unit
    const defaultUnits = request.productUnits.filter((unit) => unit.is_default);
    if (defaultUnits.length !== 1) {
        throw new ResponseError(400, "Harus ada tepat satu unit default untuk produk.");
    }

    const product = await prismaClient.$transaction(async (prisma) => {
        // Create product with units
        const createdProduct = await prisma.product.create({
            data: {
                name: request.name,
                code: request.code,
                minimum_stock: request.minimum_stock,
                description: request.description,
                indication: request.indication,
                contraindication: request.contraindication,
                side_effects: request.side_effects,
                content: request.content,
                dose: request.dose,
                category_id: request.category_id,
                group_id: request.group_id,
                allow_sale_before_expired: request.allow_sale_before_expired || 30,
                productUnits: {
                    create: request.productUnits.map((unit, index) => ({
                        unit_id: unit.unit_id,
                        price: unit.price,
                        is_default: unit.is_default || false,
                        is_base: index === 0,
                    })),
                },
            },
            include: {
                productUnits: true
            },
        });

        // Create unit conversions
        if (createdProduct.productUnits.length > 1) {
            const productUnits = createdProduct.productUnits;

            for (let i = 1; i < productUnits.length; i++) {
                const fromUnit = productUnits[i];
                const toUnit = productUnits[i - 1];
                const conversionValue = request.productUnits[i].conversion_value;

                if (!conversionValue) {
                    throw new ResponseError(
                        400,
                        `Konversi dari unit ${fromUnit.unit_id} ke unit ${toUnit.unit_id} tidak valid`
                    );
                }

                await prisma.unitConversion.create({
                    data: {
                        from_product_unit_id: fromUnit.id,
                        to_product_unit_id: toUnit.id,
                        conversion_value: conversionValue,
                    },
                });
            }
        }

        return createdProduct;
    });

    const productWithUnits = await prismaClient.product.findUnique({
        where: {id: product.id},
        include: {
            productUnits: {
                include: {
                    fromUnitConversions: true,
                    unit: true
                },
            },
        },
    });

    if (!productWithUnits) {
        throw new ResponseError(404, "Produk tidak ditemukan setelah pembuatan.");
    }

    return toProductResponse(productWithUnits)
}

const productMustExist = async (id: number): Promise<ProductWithUnits> => {
    const product = await prismaClient.product.findUnique({
        where: {
            id: id
        },
        include: {
            productUnits: {
                include: {
                    fromUnitConversions: true,
                    unit: true
                },
            }
        }
    })
    if (!product) {
        throw new ResponseError(404, 'Produk tidak ditemukan')
    }

    return product
}

const get = async (id: number): Promise<ProductResponse> => {
    id = validate(getProductValidation, id)

    const product = await productMustExist(id)
    return toProductResponse(product)
}

const remove = async (id: number): Promise<boolean> => {
    id = validate(getProductValidation, id)
    await productMustExist(id)

    await prismaClient.product.delete({
        where: {
            id: id
        }
    })

    return true;
}

const update = async (request: UpdateProductRequest): Promise<ProductResponse> => {
    request = validate(updateProductValidation, request)

    await productMustExist(request.id)

    const duplicateProduct = await prismaClient.product.findFirst({
        where: {
            code: request.code,
            id: {
                not: request.id
            }
        }
    });

    if (duplicateProduct) {
        throw new ResponseError(400, "Produk dengan kode yang sama telah ada");
    }

    const unitsExist = await prismaClient.unit.findMany({
        where: {
            id: {
                in: request.productUnits.map((unit) => unit.unit_id),
            },
        },
    });

    if (unitsExist.length !== request.productUnits.length) {
        throw new ResponseError(404, "Salah satu unit tidak ditemukan");
    }

    const defaultUnits = request.productUnits.filter((unit) => unit.is_default);
    if (defaultUnits.length !== 1) {
        throw new ResponseError(400, "Harus ada tepat satu unit default untuk produk.");
    }

    await prismaClient.product.update({
        where: {id: request.id},
        data: {
            name: request.name,
            code: request.code,
            minimum_stock: request.minimum_stock,
            allow_sale_before_expired: request.allow_sale_before_expired,
            description: request.description,
            indication: request.indication,
            contraindication: request.contraindication,
            side_effects: request.side_effects,
            content: request.content,
            dose: request.dose,
            category_id: request.category_id,
            group_id: request.group_id,
        },
        include: {
            productUnits: {
                include: {
                    unit: true,
                    fromUnitConversions: true,
                },
            },
        },
    });

    await prismaClient.productUnit.deleteMany({
        where: {product_id: request.id},
    });

    await prismaClient.productUnit.createMany({
        data: request.productUnits.map((unit) => ({
            product_id: request.id,
            unit_id: unit.unit_id,
            price: unit.price,
            is_default: unit.is_default || false,
        })),
    });

    if (request.productUnits.length > 1) {
        const productUnits = await prismaClient.productUnit.findMany({
            where: {product_id: request.id},
        });

        for (let i = 1; i < productUnits.length; i++) {
            const fromUnit = productUnits[i];
            const toUnit = productUnits[i - 1];
            const conversion_value = request.productUnits[i].conversion_value;

            if (!conversion_value) {
                throw new ResponseError(
                    404,
                    `Konversi dari unit ${fromUnit.unit_id} ke unit ${toUnit.unit_id} tidak valid`
                );
            }

            await prismaClient.unitConversion.create({
                data: {
                    from_product_unit_id: fromUnit.id,
                    to_product_unit_id: toUnit.id,
                    conversion_value,
                },
            });
        }
    }

    const productWithUnits = await prismaClient.product.findFirstOrThrow({
        where: {id: request.id},
        include: {
            productUnits: {
                include: {
                    unit: true,
                    fromUnitConversions: true,
                },
            },
        },
    });

    return toProductResponse(productWithUnits)
}

const search = async (request: SearchProductRequest): Promise<Pageable<SearchProductResponse>> => {
    request = validate(searchProductValidation, request)

    const filterableFields: FilterConfig[] = [
        {key: 'name'},
        {key: 'code'},
        {key: 'category_id', exact: true},
        {key: 'group_id', exact: true},
        {key: 'minimum_stock', operation: 'lte', exact: true},
        {key: 'allow_sale_before_expired', operation: 'lte', exact: true}
    ]

    const filters = buildFilters(filterableFields, request);

    const skip = (request.page - 1) * request.size;

    const products = await prismaClient.product.findMany({
        where: {
            AND: filters
        },
        select: {
            id: true,
            name: true,
            code: true,
            allow_sale_before_expired: true,
            minimum_stock: true,
            category_id: true,
            group_id: true,
            group: true,
            category: true
        },
        take: request.size,
        skip: skip
    })

    const totalItems = await prismaClient.product.count({
        where: {
            AND: filters
        }
    })

    return {
        data: products.map(product => toSearchProductResponse(product)),
        paging: {
            page: request.page,
            total_item: totalItems,
            total_page: Math.ceil(totalItems / request.size)
        }
    }
}

export default {
    create,
    productMustExist,
    get,
    remove,
    update,
    search
}