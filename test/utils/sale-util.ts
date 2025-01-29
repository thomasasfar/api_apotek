import {prismaClient} from "../../src/application/database";
import {Sale} from "@prisma/client";
import {getTestUser} from "./user-util";
import {getManyTestProduct} from "./product-util";

export const removeAllTestSales = async () => {
    const sales = await prismaClient.sale.findMany({
        where: {
            code: {
                contains: 'PJ'
            }
        },
        include: {
            saleDetails: {
                include: {
                    saleStocks: {
                        include: {
                            stock: true
                        }
                    }
                }
            }
        }
    });

    for (const sale of sales) {
        for (const detail of sale.saleDetails) {
            // for (const saleStock of detail.saleStocks) {
            //     if (saleStock.stock) {
            //         const updatedQuantity =
            //             saleStock.stock.quantity + saleStock.quantity;
            //
            //         await prismaClient.stock.update({
            //             where: {
            //                 id: saleStock.stock.id,
            //             },
            //             data: {
            //                 quantity: updatedQuantity,
            //             },
            //         });
            //     }
            // }
            await prismaClient.saleStock.deleteMany({
                where: {
                    sale_detail_id: detail.id,
                },
            });
        }
        await prismaClient.saleDetail.deleteMany({
            where: {
                sale_id: sale.id,
            },
        });
    }
    return prismaClient.sale.deleteMany({
        where: {
            code: {
                contains: 'PJ'
            }
        }
    });
};

export const createTestSale = async () => {
    const testUser = await getTestUser()
    const testProduct = await getManyTestProduct()

    const defaultUnit = testProduct[0].productUnits.find((unit) => unit.is_default);

    if (!defaultUnit) {
        throw new Error("Unit default untuk produk tidak ditemukan");
    }

    // Find an available stock for the product
    const availableStock = await prismaClient.stock.findFirst({
        where: {
            product_id: testProduct[0].id,
            quantity: {gt: 0}
        }
    });

    if (!availableStock) {
        throw new Error("Tidak ada stok yang tersedia untuk penjualan");
    }

    const quantity = 5; // Example quantity
    const totalPayment = defaultUnit.price * quantity;

    return prismaClient.sale.create({
        data: {
            code: 'PJ-test',
            user_id: testUser.id,
            total_payment: totalPayment,
            change: 0,
            saleDetails: {
                create: [
                    {
                        product_id: testProduct[0].id,
                        product_unit_id: defaultUnit.id,
                        quantity: quantity,
                        price: defaultUnit.price,
                        saleStocks: {
                            create: {
                                stock_id: availableStock.id,
                                quantity: quantity
                            }
                        }
                    }
                ]
            }
        },
        include: {
            saleDetails: {
                include: {
                    saleStocks: true,
                    product: true,
                    productUnit: true
                }
            }
        }
    });
}

export const getTestSale = async (): Promise<Sale> => {
    return prismaClient.sale.findFirstOrThrow({
        where: {
            code: 'PJ-test'
        }
    })
}

export const createManyTestSale = async (numberOfSales = 15) => {
    const testUser = await getTestUser();
    const testProducts = await getManyTestProduct();

    const sales = [];

    for (let i = 0; i < numberOfSales; i++) {
        const testProduct = testProducts[i % testProducts.length]; // Cycle through products if numberOfSales > testProducts.length

        const defaultUnit = testProduct.productUnits.find((unit) => unit.is_default);

        if (!defaultUnit) {
            throw new Error("Unit default untuk produk tidak ditemukan");
        }

        // Find an available stock for the product
        const availableStock = await prismaClient.stock.findFirst({
            where: {
                product_id: testProduct.id,
                quantity: {gt: 0}
            }
        });

        if (!availableStock) {
            throw new Error("Tidak ada stok yang tersedia untuk penjualan");
        }

        const quantity = 5; // Example quantity
        const totalPayment = defaultUnit.price * quantity;

        const sale = await prismaClient.sale.create({
            data: {
                code: `PJ-test-${i + 1}`,
                user_id: testUser.id,
                total_payment: totalPayment,
                change: 0,
                saleDetails: {
                    create: [
                        {
                            product_id: testProduct.id,
                            product_unit_id: defaultUnit.id,
                            quantity: quantity,
                            price: defaultUnit.price,
                            saleStocks: {
                                create: {
                                    stock_id: availableStock.id,
                                    quantity: quantity
                                }
                            }
                        }
                    ]
                }
            },
            include: {
                saleDetails: {
                    include: {
                        saleStocks: true,
                        product: true,
                        productUnit: true
                    }
                }
            }
        });

        sales.push(sale);
    }

    return sales;
}