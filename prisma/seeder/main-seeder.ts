import {seedGroup} from "./group-seeder";
import {seedCategory} from "./category-seeder";
import {logger} from "../../src/application/logging";
import {prismaClient} from "../../src/application/database";

async function main() {
    try {
        await seedCategory();
        await seedGroup()
    } catch (e) {
        logger.error(e);
    } finally {
        await prismaClient.$disconnect();
    }
}

main()
    .then(() => logger.info("Seeding completed."))
    .catch(() => process.exit(1));