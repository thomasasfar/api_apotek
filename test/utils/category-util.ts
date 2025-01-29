import {prismaClient} from "../../src/application/database";
import {Category} from "@prisma/client";

export const createTestCategory = async () => {
    await prismaClient.category.create({
        data: {
            name: 'test',
            description: 'test',
        }
    })
}

export const createManyTestCategory = async () => {
    for (let i = 1; i < 15; i++) {
        await prismaClient.category.create({
            data: {
                name: `test ${i}`,
                description: `test ${i} description`
            }
        })
    }
}

export const getTestCategory = async (): Promise<Category> => {
    return prismaClient.category.findFirstOrThrow({
        where: {
            name: 'test'
        }
    })
}

export const removeAllTestCategory = async () => {
    await prismaClient.category.deleteMany({
        where: {
            name: {
                contains: 'test',
            },
        },
    });
};