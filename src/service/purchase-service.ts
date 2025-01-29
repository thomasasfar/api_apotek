import {
    CreatePurchaseRequest,
    PurchaseResponse,
    PurchaseWithDetail,
    SearchPurchaseRequest,
    SearchPurchaseResponse,
    toPurchaseRespons,
    toSearchPurchaseResponse
} from "../model/purchase-model";
import {validate} from "../validation/validation";
import {
    createPurchaseValidation,
    getPurchaseValidation,
    searchPurchaseValidation
} from "../validation/purchase-validation";
import {prismaClient} from "../application/database";
import {ResponseError} from "../error/response-error";
import supplierService from "./supplier-service";
import {convertToSmallestUnit} from "../helpers/unit-helper";
import {FilterConfig, Pageable} from "../model/page-model";
import {buildFilters} from "../helpers/filter-helper";
import {Product} from "@prisma/client";

const create = async (request: CreatePurchaseRequest): Promise<PurchaseResponse> => {
    request = validate(createPurchaseValidation, request);

    const duplicatePurchase = await prismaClient.purchase.findUnique({
        where: {
            code_supplier_id: {
                code: request.code,
                supplier_id: request.supplier_id,
            }
        }
    })

    if (duplicatePurchase) {
        throw new ResponseError(400, "Pembelian dengan no faktur dan supplier yang sama telah ada");
    }

    await supplierService.supplierMustExist(request.supplier_id);

    const productIds = request.items.map((item) => item.product_id);
    const productUnits = request.items.map((item) => item.product_unit_id);

    const products: Product[] = await prismaClient.product.findMany({
        where: {id: {in: productIds}},
    });

    if (products.length !== productIds.length) {
        throw new ResponseError(404, "Salah satu produk tidak ditemukan");
    }

    const units = await prismaClient.productUnit.findMany({
        where: {id: {in: productUnits}},
        include: {
            toUnitConversions: {
                where: {
                    toProductUnit: {is_base: true},
                },
            },
        },
    });

    if (units.length !== productUnits.length) {
        throw new ResponseError(404, "Salah satu unit tidak ditemukan");
    }

    const itemsWithSmallestUnits = await Promise.all(request.items.map(async (item) => {
        const productUnit = units.find((unit) =>
            unit.id === item.product_unit_id
        );

        if (!productUnit) {
            throw new ResponseError(
                400,
                `Unit tidak valid untuk produk ID ${item.product_id}`
            );
        }

        const quantityInSmallestUnit = await convertToSmallestUnit(
            item.product_unit_id,
            item.amount
        );

        return {
            ...item,
            product_unit_id: item.product_unit_id,
            quantityInSmallestUnit
        };
    }));

    await prismaClient.purchase.create({
        data: {
            code: request.code,
            supplier_id: request.supplier_id,
            purchase_date: request.purchase_date,
            note: request.note,
            user_id: request.user_id,
            purchaseDetails: {
                create: itemsWithSmallestUnits.map((item) => ({
                    stock: {
                        create: {
                            product_id: item.product_id,
                            batch_number: item.batch_number,
                            expired_date: item.expired_date,
                            quantity: item.quantityInSmallestUnit,
                        },
                    },
                    price: item.price,
                    amount: item.amount,
                    productUnit: {
                        connect: {
                            id: item.product_unit_id
                        }
                    }
                })),
            },
        },
        include: {
            purchaseDetails: {
                include: {stock: true},
            },
        },
    });

    const purchase = await prismaClient.purchase.findFirst({
        where: {
            AND: {
                code: request.code,
                supplier_id: request.supplier_id,
            }
        },
        include: {
            purchaseDetails: {
                include: {
                    stock: true,
                    productUnit: {
                        include: {
                            unit: true
                        }
                    }
                }
            },
            supplier: true
        }
    })

    if (!purchase) {
        throw new ResponseError(404, "Pembelian tidak ditemukan setelah dibuat");
    }

    return toPurchaseRespons(purchase)
}

const purchaseMustExist = async (id: number): Promise<PurchaseWithDetail> => {
    const purchase = await prismaClient.purchase.findUnique({
        where: {
            id: id
        },
        include: {
            purchaseDetails: {
                include: {
                    stock: true,
                    productUnit: {
                        include: {
                            unit: true
                        }
                    }
                }
            },
            supplier: true
        }
    })

    if (!purchase) {
        throw new ResponseError(404, 'Data pembelian tidak ditemukan')
    }

    return purchase
}

const get = async (id: number): Promise<PurchaseResponse> => {
    id = validate(getPurchaseValidation, id)
    const purchase = await purchaseMustExist(id)
    return toPurchaseRespons(purchase)
}

const search = async (request: SearchPurchaseRequest): Promise<Pageable<SearchPurchaseResponse>> => {
    request = validate(searchPurchaseValidation, request)

    const filterableFields: FilterConfig[] = [
        {key: 'code'},
        {key: 'supplier_id'},
        {key: 'user_id'},
        {key: 'month', field: 'purchase_date', operation: 'month'},
    ]

    const filters = buildFilters(filterableFields, request);

    const skip = (request.page - 1) * request.size;

    const purchases = await prismaClient.purchase.findMany({
        where: {
            AND: filters
        },
        select: {
            id: true,
            code: true,
            supplier_id: true,
            user_id: true,
            purchase_date: true,
            supplier: {
                select: {
                    id: true,
                    name: true
                }
            },
            user: {
                select: {
                    id: true,
                    username: true,
                    name: true,
                }
            },
        },
        take: request.size,
        skip: skip
    })

    const totalItems = await prismaClient.purchase.count({
        where: {
            AND: filters
        }
    })

    return {
        data: purchases.map(purchase => toSearchPurchaseResponse(purchase)),
        paging: {
            page: request.page,
            total_item: totalItems,
            total_page: Math.ceil(totalItems / request.size)
        }
    }
}

export default {
    create,
    get,
    search
}