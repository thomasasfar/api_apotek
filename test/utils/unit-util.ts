import {prismaClient} from "../../src/application/database";
import {Unit} from "@prisma/client";

export const createTestUnit = async () => {
    await prismaClient.unit.create({
        data: {
            id: 1,
            name: 'test'
        }
    })
}

export const createManyTestUnit = async () => {
    for (let i = 1; i < 15; i++) {
        await prismaClient.unit.create({
            data: {
                id: i,
                name: `test ${i}`,
            }
        })
    }
}

export const getTestUnit = async (): Promise<Unit> => {
    return prismaClient.unit.findFirstOrThrow({
        where: {
            name: 'test'
        }
    })
}

export const getTestUnit2 = async (): Promise<Unit> => {
    return prismaClient.unit.findFirstOrThrow({
        where: {
            name: {
                contains: 'test'
            }
        }
    })
}

export const getManyTestUnit = async (): Promise<Array<Unit>> => {
    return prismaClient.unit.findMany({
        where: {
            name: {
                contains: 'test'
            }
        }
    })
}

export const removeAllTestUnits = async () => {
    await prismaClient.unit.deleteMany({
        where: {
            name: {
                contains: 'test',
            }
        }
    })
}