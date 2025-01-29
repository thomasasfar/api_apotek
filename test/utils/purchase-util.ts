import {prismaClient} from "../../src/application/database";
import {getManyTestProduct} from "./product-util";
import {getTestUser} from "./user-util";
import {getTestSupplier} from "./supplier-util";
import {PurchaseWithDetail} from "../../src/model/purchase-model";

export const removeAllTestPurchase = async () => {
    const purchases = await prismaClient.purchase.findMany({
        where: {
            code: {
                contains: 'test',
            }
        },
        include: {
            purchaseDetails: {
                include: {
                    stock: true
                }
            }
        }
    })

    for (const purchase of purchases) {
        // Hapus semua purchase details
        await prismaClient.purchaseDetail.deleteMany({
            where: {
                purchase_id: purchase.id,
            },
        });

        for (const detail of purchase.purchaseDetails) {
            if (detail.stock) {
                await prismaClient.stock.delete({
                    where: {
                        id: detail.stock.id,
                    },
                });
            }
        }
    }

    return prismaClient.purchase.deleteMany({
        where: {
            code: {
                contains: 'test',
            }
        }
    })
}

export const createTestPurchase = async () => {
    const testSupplier = await getTestSupplier()
    const testUser = await getTestUser()
    const testProduct = await getManyTestProduct()

    const defaultUnit = testProduct[0].productUnits.find((unit) => unit.is_default);

    if (!defaultUnit) {
        throw new Error("Unit default untuk produk tidak ditemukan");
    }

    return prismaClient.purchase.create({
        data: {
            code: 'test',
            supplier_id: testSupplier.id,
            user_id: testUser.id,
            purchase_date: new Date(),
            note: 'Test purchase',
            purchaseDetails: {
                create: [
                    {
                        stock: {
                            create: {
                                product_id: testProduct[0].id,
                                batch_number: 'BATCH123',
                                expired_date: new Date(new Date().setFullYear(new Date().getFullYear() + 1)), // Expired date 1 tahun ke depan
                                quantity: 100,
                            },
                        },
                        productUnit: {
                            connect: {
                                id: defaultUnit.id,
                            }
                        },
                        price: defaultUnit.price,
                        amount: 10,
                    },
                    {
                        stock: {
                            create: {
                                product_id: testProduct[1].id,
                                batch_number: 'BATCH124',
                                expired_date: new Date(new Date().setFullYear(new Date().getFullYear() + 1)), // Expired date 1 tahun ke depan
                                quantity: 50,
                            },
                        },
                        productUnit: {
                            connect: {
                                id: defaultUnit.id,
                            }
                        },
                        price: defaultUnit.price,
                        amount: 10,
                    },
                ],
            },
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
            }
        }
    });
}

export const getTestPurchase = async (): Promise<PurchaseWithDetail> => {
    return prismaClient.purchase.findFirstOrThrow({
        where: {
            code: 'test'
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
            supplier: true,
        }
    })
}

export const createManyTestPurchase = async (count = 15) => {
    const testSupplier = await getTestSupplier();
    const testUser = await getTestUser();
    const testProduct = await getManyTestProduct();

    const purchases = [];

    for (let i = 0; i < count; i++) {
        const defaultUnit = testProduct[i % testProduct.length].productUnits.find((unit) => unit.is_default);

        if (!defaultUnit) {
            throw new Error(`Unit default untuk produk ${testProduct[i % testProduct.length].id} tidak ditemukan`);
        }

        const purchase = await prismaClient.purchase.create({
            data: {
                code: `test-${i + 1}`, // Membuat kode unik untuk setiap pembelian
                supplier_id: testSupplier.id,
                user_id: testUser.id,
                purchase_date: new Date(new Date().setDate(new Date().getDate() - i)), // Tanggal mundur berdasarkan iterasi
                note: `Test purchase ${i + 1}`,
                purchaseDetails: {
                    create: [
                        {
                            stock: {
                                create: {
                                    product_id: testProduct[i % testProduct.length].id,
                                    batch_number: `BATCH123-${i + 1}`,
                                    expired_date: new Date(new Date().setFullYear(new Date().getFullYear() + 1)), // Expired date 1 tahun ke depan
                                    quantity: 100 + i,
                                },
                            },
                            productUnit: {
                                connect: {
                                    id: defaultUnit.id,
                                },
                            },
                            price: defaultUnit.price,
                            amount: 10 + i,
                        },
                        {
                            stock: {
                                create: {
                                    product_id: testProduct[i % testProduct.length].id,
                                    batch_number: `BATCH12345-${i + 1}`,
                                    expired_date: new Date(new Date().setFullYear(new Date().getFullYear() + 1)), // Expired date 1 tahun ke depan
                                    quantity: 100 + i,
                                },
                            },
                            productUnit: {
                                connect: {
                                    id: defaultUnit.id,
                                },
                            },
                            price: defaultUnit.price,
                            amount: 10 + i,
                        },
                    ],
                },
            },
            include: {
                purchaseDetails: {
                    include: {stock: true},
                },
            },
        });

        purchases.push(purchase);
    }

    return purchases;
};
