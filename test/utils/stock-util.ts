import {getManyTestProduct} from "./product-util";
import {prismaClient} from "../../src/application/database";

export const createManyTestStockAlmostFinished = async () => {
    const testProduct = await getManyTestProduct();

    for (let i = 0; i < 15; i++) {
        await prismaClient.stock.createMany({
            data: {
                product_id: testProduct[i % testProduct.length].id,
                batch_number: `BATCH123-${i + 1}`,
                expired_date: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
                quantity: 1 + i,
            }
        })
    }
}

export const createManyTestStock = async () => {
    const testProduct = await getManyTestProduct();

    for (let i = 0; i < 15; i++) {
        await prismaClient.stock.createMany({
            data: {
                product_id: testProduct[i % testProduct.length].id,
                batch_number: `BATCH1234-${i + 1}`,
                expired_date: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
                quantity: 2000,
            }
        })
    }
}

export const removeAllTestStocks = async () => {
    await prismaClient.stock.deleteMany({
        where: {
            batch_number: {
                contains: `BATCH`
            }
        }
    })
}