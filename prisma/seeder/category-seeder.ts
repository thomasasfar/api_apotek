import {prismaClient} from "../../src/application/database";
import {logger} from "../../src/application/logging";

export async function seedCategory() {
    const categories = await prismaClient.category.createMany({
        data: [
            {
                id: 1,
                name: 'None',
                is_default: true
            }
        ]
    });
    logger.info(categories);
}

seedCategory()
    .then(async () => {
        await prismaClient.$disconnect();
    })
    .catch(async (e) => {
        logger.error(e);
        await prismaClient.$disconnect();
        process.exit(1);
    });