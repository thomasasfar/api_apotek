import {prismaClient} from "../../src/application/database";
import bcrypt from "bcrypt";
import {generateAccessToken} from "../../src/application/jwt";
import {User} from "@prisma/client";

export const removeAllTestUser = async () => {
    await prismaClient.user.deleteMany({
        where: {
            username: {
                contains: 'test'
            }
        }
    })
}

export const createTestUser = async () => {
    await prismaClient.user.create({
        data: {
            username: "test",
            password: await bcrypt.hash("rahasia", 10),
            name: "test",
            role: 'SUPERADMIN'
        }
    })
}

export const createTestPramuniaga = async () => {
    await prismaClient.user.create({
        data: {
            username: "testCashier",
            password: await bcrypt.hash("rahasia", 10),
            name: "cashier Test",
            role: 'PRAMUNIAGA'
        }
    })
}

export const createTestTTF = async () => {
    await prismaClient.user.create({
        data: {
            username: 'testTTF',
            password: await bcrypt.hash("rahasia", 10),
            name: "cashier Test",
            role: 'TTF'
        }
    })
}

export const getTestToken = async () => {
    const user = await prismaClient.user.findFirst({
        where: {
            role: 'SUPERADMIN'
        }
    });
    if (!user) {
        throw new Error("Test user not found");
    }

    const token = generateAccessToken(user);
    if (!token) {
        throw new Error("Failed to generate test token");
    }

    return token;
}

export const getPramuniagaToken = async () => {
    const user = await prismaClient.user.findFirst({
        where: {
            role: 'PRAMUNIAGA'
        }
    });
    if (!user) {
        throw new Error("Pramuniaga user not found");
    }

    const token = generateAccessToken(user);
    if (!token) {
        throw new Error("Failed to generate test token");
    }

    return token;
}

export const getTTFToken = async () => {
    const user = await prismaClient.user.findFirst({
        where: {
            role: 'TTF'
        }
    });
    if (!user) {
        throw new Error("TTF user not found");
    }

    const token = generateAccessToken(user);
    if (!token) {
        throw new Error("Failed to generate test token");
    }

    return token;
}

export const getTestUser = async (): Promise<User> => {
    return prismaClient.user.findFirstOrThrow({
        where: {
            username: 'test'
        }
    })
}