import {prismaClient} from "../../src/application/database";
import {Supplier} from "@prisma/client";

export const createTestSupplier = async () => {
    await prismaClient.supplier.create({
        data: {
            code: 'SUP-0001',
            name: 'test',
            address: 'test',
            phone: '081212121313',
            email: 'test@test.com',
            npwp: '01.234.567.8-912.345',
        }
    })
}

export const createManyTestSupplier = async () => {
    for (let i = 1; i < 15; i++) {
        await prismaClient.supplier.create({
            data: {
                code: `SUP-000${i}`,
                name: `test ${i}`,
                address: `test ${i}`,
                phone: `0812121213${i}`,
                email: `test${i}@test.com`,
                npwp: `01.234.567.8-912.3${i}`,
            }
        })
    }
}

export const getTestSupplier = async (): Promise<Supplier> => {
    return prismaClient.supplier.findFirstOrThrow({
        where: {
            name: 'test'
        }
    })
}

export const removeAllTestSupplier = async () => {
    await prismaClient.supplier.deleteMany({
        where: {
            name: {
                contains: 'test',
            },
        },
    });
};