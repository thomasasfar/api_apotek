import {prismaClient} from "../../src/application/database";
import {Group} from "@prisma/client";

export const createTestGroup = async () => {
    await prismaClient.group.create({
        data: {
            id: 2,
            name: 'test',
            description: 'test',
        }
    })
}

export const createManyTestGroup = async () => {
    for (let i = 1; i < 15; i++) {
        await prismaClient.group.create({
            data: {
                name: `test ${i}`,
                description: `test ${i} description`,
            }
        })
    }
}

export const getTestGroup = async (): Promise<Group> => {
    return prismaClient.group.findFirstOrThrow({
        where: {
            name: 'test'
        }
    })
}

export const removeAllTestGroups = async () => {
    await prismaClient.group.deleteMany({
        where: {
            name: {
                contains: 'test',
            }
        }
    })
}