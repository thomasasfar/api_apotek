import {prismaClient} from "../../src/application/database";
import {getTestGroup} from "./group-util";
import {getTestCategory} from "./category-util";
import {getTestUnit2} from "./unit-util";
import {Product} from "@prisma/client";
import {ProductWithUnits} from "../../src/model/product-model";

export const removeAllTestProduct = async () => {
    await prismaClient.product.deleteMany({
        where: {
            name: {
                contains: "test"
            }
        }
    });
}

export const createTestProduct = async () => {
    const testGroup = await getTestGroup();
    const testCategory = await getTestCategory();
    const testUnit = await getTestUnit2();

    const product = await prismaClient.product.create({
        data: {
            name: 'test',
            code: 'test',
            minimum_stock: 10,
            description: 'test',
            indication: 'test',
            contraindication: 'test',
            side_effects: 'test',
            content: 'test',
            dose: 'test',
            category_id: testCategory.id,
            group_id: testGroup.id,
            productUnits: {
                create: [
                    {
                        unit_id: testUnit.id,
                        price: 500,
                        is_default: true,
                    },
                    {
                        unit_id: testUnit.id + 1,
                        price: 4500,
                    },
                    {
                        unit_id: testUnit.id + 2,
                        price: 40000,
                    },
                ],
            },
        },
        include: {
            productUnits: true,
        },
    });

    const productUnits = product.productUnits;

    for (let i = 1; i < productUnits.length; i++) {
        const fromUnit = productUnits[i];
        const toUnit = productUnits[i - 1];

        await prismaClient.unitConversion.create({
            data: {
                from_product_unit_id: fromUnit.id,
                to_product_unit_id: toUnit.id,
                conversion_value: 10,
            },
        });
    }

    return product;
};

export const getTestProduct = async (): Promise<ProductWithUnits> => {
    return prismaClient.product.findFirstOrThrow({
        where: {
            name: 'test'
        },
        include: {
            productUnits: {
                include: {
                    fromUnitConversions: true,
                    unit: true
                },
            },
        },
    })
}

export const createManyTestProduct = async () => {
    const testGroup = await getTestGroup();
    const testCategory = await getTestCategory();
    const testUnit = await getTestUnit2();

    for (let i = 1; i < 15; i++) {
        const product = await prismaClient.product.create({
            data: {
                name: `test ${i}`,
                code: `test ${i}`,
                minimum_stock: 10 * i,
                allow_sale_before_expired: 10 + (2 * i),
                description: `test description ${i}`,
                indication: `test indication ${i}`,
                contraindication: `test contraindication ${i}`,
                side_effects: `test side effects ${i}`,
                content: `test content ${i}`,
                dose: `test dose ${i}`,
                category_id: testCategory.id,
                group_id: testGroup.id,
                productUnits: {
                    create: [
                        {
                            unit_id: testUnit.id,
                            price: 500 * i,
                            is_default: true,
                            is_base: true
                        },
                        {
                            unit_id: testUnit.id + 1,
                            price: 4500 * i,
                        },
                        {
                            unit_id: testUnit.id + 2,
                            price: 40000 * i,
                        },
                    ],
                },
            },
            include: {
                productUnits: true,
            },
        });

        const productUnits = product.productUnits;

        for (let j = 1; j < productUnits.length; j++) {
            const toUnit = productUnits[j - 1];
            const fromUnit = productUnits[j];

            await prismaClient.unitConversion.create({
                data: {
                    from_product_unit_id: fromUnit.id,
                    to_product_unit_id: toUnit.id,
                    conversion_value: 10,
                },
            });
        }
    }
};

export const getTestProduct2 = async (): Promise<Product> => {
    return prismaClient.product.findFirstOrThrow({
        where: {
            name: {
                contains: 'test'
            }
        },
        include: {
            productUnits: {
                include: {
                    unit: true,
                },
            },
        },
    })
}

export const getManyTestProduct = async (): Promise<Array<ProductWithUnits>> => {
    return prismaClient.product.findMany({
        where: {
            name: {
                contains: 'test'
            }
        },
        include: {
            productUnits: {
                include: {
                    unit: true,
                    fromUnitConversions: true,
                },
            },
        },
    })
}
