import {
    CreateSaleRequest,
    SaleResponse,
    SaleStockResponse,
    SaleWithDetail,
    SearchSaleRequest,
    toSaleResponse
} from "../model/sale-model";
import {prismaClient} from "../application/database";
import {validate} from "../validation/validation";
import {createSaleValidation, getSaleValidation, searchSaleValidation} from "../validation/sale-validation";
import {convertToSmallestUnit} from "../helpers/unit-helper";
import {ResponseError} from "../error/response-error";
import {FilterConfig, Pageable} from "../model/page-model";
import {buildFilters} from "../helpers/filter-helper";

const generateSaleCode = async (): Promise<string> => {
    const now = new Date();
    const year = now.getFullYear().toString().slice(2);
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const datePrefix = `${year}${month}${day}`;

    const lastSale = await prismaClient.sale.findFirst({
        where: {
            code: {
                startsWith: `PJ-${datePrefix}`,
            },
        },
        orderBy: {
            code: "desc",
        },
    });

    let sequence = 1;
    if (lastSale) {
        const lastCode = lastSale.code;
        const lastSequence = parseInt(lastCode.slice(-4));
        sequence = lastSequence + 1;
    }

    return `PJ-${datePrefix}${String(sequence).padStart(4, "0")}`;
};

const create = async (request: CreateSaleRequest): Promise<SaleResponse> => {
    request = validate(createSaleValidation, request)

    let totalPrice = 0;
    const saleCode = await generateSaleCode()

    const saleDetails = []
    const saleStocks: SaleStockResponse[] = []

    for (const item of request.items) {
        const product = await prismaClient.product.findUnique({
            where: {
                id: item.product_id,
            }
        })

        if (!product) {
            throw new ResponseError(404, `Product dengan id: ${item.product_id} tidak ditemukan`)
        }

        const productUnit = await prismaClient.productUnit.findUnique({
            where: {
                id: item.product_unit_id
            }
        });

        if (!productUnit) {
            throw new ResponseError(404, `ProductUnit tidak ditemukan untuk product_unit_id: ${item.product_unit_id}`);
        }

        const currentDate = new Date();
        const thresholdDate = new Date();
        thresholdDate.setDate(currentDate.getDate() + product.allow_sale_before_expired);

        const quantityInSmallestUnit = await convertToSmallestUnit(item.product_unit_id, item.quantity);

        const stocks = await prismaClient.stock.findMany({
            where: {
                product_id: item.product_id,
                quantity: {
                    gt: 0
                },
                expired_date: {
                    gt: thresholdDate
                }
            },
            orderBy: {
                created_at: 'asc'
            }
        })

        if (stocks.length === 0) {
            throw new ResponseError(
                400,
                `Stok untuk product_id: ${item.product_id} tidak mencukupi atau stok akan segera kadaluarsa`
            );
        }

        let remainingQuantity = quantityInSmallestUnit;
        const itemSaleStocks = [];

        for (const stock of stocks) {
            if (remainingQuantity <= 0) break;

            const usedQuantity = Math.min(stock.quantity, remainingQuantity);
            remainingQuantity -= usedQuantity;

            await prismaClient.stock.update({
                where: {
                    id: stock.id,
                },
                data: {
                    quantity: stock.quantity - usedQuantity,
                },
            });

            const originalUnitQuantity = usedQuantity / (quantityInSmallestUnit / item.quantity);

            itemSaleStocks.push({
                stock_id: stock.id,
                quantity: originalUnitQuantity,
            });
        }

        if (remainingQuantity > 0) {
            throw new ResponseError(400, `Stok untuk product_id: ${item.product_id} tidak mencukupi`);
        }

        const itemTotalPrice = productUnit.price * item.quantity;
        totalPrice += itemTotalPrice;

        const saleDetailIndex = saleDetails.push({
            product_id: item.product_id,
            product_unit_id: item.product_unit_id,
            quantity: item.quantity,
            price: productUnit.price,
        }) - 1;

        saleStocks.push(
            ...itemSaleStocks.map((saleStock) => ({
                sale_detail_index: saleDetailIndex,
                ...saleStock,
            }))
        );
    }

    const change = request.total_payment - totalPrice;

    if (change < 0) {
        throw new ResponseError(400, "Total pembayaran kurang dari total harga");
    }

    const groupedSaleDetails = saleDetails.map((detail, index) => ({
        ...detail,
        saleStocks: {
            create: saleStocks
                .filter((stock) => stock.sale_detail_index === index)
                .map(({sale_detail_index, ...stockData}) => stockData),
        },
    }));

    const createSale = await prismaClient.sale.create({
        data: {
            code: saleCode,
            user_id: request.user_id,
            total_payment: request.total_payment,
            change: change,
            saleDetails: {
                create: groupedSaleDetails
            }
        },
        include: {
            saleDetails: {
                include: {
                    saleStocks: true
                }
            }
        },
    })

    const sale = await saleMustExist(createSale.id)

    if (!sale || !sale.saleDetails || sale.saleDetails.length === 0) {
        throw new Error("Sale data is incomplete or not found");
    }

    return toSaleResponse(sale)
}

const saleMustExist = async (id: number): Promise<SaleWithDetail> => {
    const sale = await prismaClient.sale.findUnique({
        where: {
            id: id
        },
        include: {
            saleDetails: {
                include: {
                    saleStocks: {
                        include: {
                            stock: {
                                select: {
                                    id: true,
                                    batch_number: true,
                                }
                            }
                        }
                    },
                    product: {
                        select: {
                            id: true,
                            name: true,
                            code: true,
                        }
                    },
                    productUnit: {
                        select: {
                            id: true,
                            unit_id: true,
                            price: true,
                            unit: {
                                select: {
                                    id: true,
                                    name: true,
                                },
                            },
                        }
                    },
                }
            },
            user: true
        }
    })

    if (!sale || !sale.saleDetails || sale.saleDetails.length === 0) {
        throw new ResponseError(404, 'Data penjualan tidak ditemukan')
    }

    return sale
}

const get = async (id: number): Promise<SaleResponse> => {
    id = validate(getSaleValidation, id)
    const sale = await saleMustExist(id)
    return toSaleResponse(sale)
}

const search = async (request: SearchSaleRequest): Promise<Pageable<SaleResponse>> => {
    request = validate(searchSaleValidation, request)

    const filterableFields: FilterConfig[] = [
        {key: 'user_id'},
        {key: 'month', field: 'created_at', operation: 'month'},
        {key: 'date_range', field: 'created_at', operation: 'date_range'},
    ]

    const filters = buildFilters(filterableFields, request);

    const skip = (request.page - 1) * request.size;

    const sales = await prismaClient.sale.findMany({
        where: {
            AND: filters
        },
        include: {
            saleDetails: {
                include: {
                    saleStocks: {
                        include: {
                            stock: {
                                select: {
                                    id: true,
                                    batch_number: true,
                                }
                            }
                        }
                    },
                    product: {
                        select: {
                            id: true,
                            name: true,
                            code: true,
                        }
                    },
                    productUnit: {
                        select: {
                            id: true,
                            unit_id: true,
                            price: true,
                            unit: {
                                select: {
                                    id: true,
                                    name: true,
                                },
                            },
                        }
                    },
                }
            },
            user: true
        },
        take: request.size,
        skip: skip
    })

    const totalItems = await prismaClient.sale.count({
        where: {
            AND: filters
        }
    })

    return {
        data: sales.map((sale) => toSaleResponse(sale)),
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
