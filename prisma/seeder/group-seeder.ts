import {prismaClient} from "../../src/application/database";
import {logger} from "../../src/application/logging";

export async function seedGroup() {
    const groups = await prismaClient.group.createMany({
        data: [
            {
                id: 1,
                name: 'None',
                is_default: true
            }
        ]
    });
    logger.info(groups);
}

seedGroup()
    .then(async () => {
        await prismaClient.$disconnect();
    })
    .catch(async (e) => {
        logger.error(e);
        await prismaClient.$disconnect();
        process.exit(1);
    });