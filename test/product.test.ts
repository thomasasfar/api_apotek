import {
    createTestPramuniaga,
    createTestUser,
    getPramuniagaToken,
    getTestToken,
    removeAllTestUser
} from "./utils/user-util";
import {createTestGroup, getTestGroup, removeAllTestGroups} from "./utils/group-util";
import {createTestCategory, getTestCategory, removeAllTestCategory} from "./utils/category-util";
import {createManyTestUnit, getTestUnit2, removeAllTestUnits} from "./utils/unit-util";
import {Category, Group, Unit} from "@prisma/client";
import {createManyTestProduct, createTestProduct, getTestProduct, removeAllTestProduct} from "./utils/product-util";
import supertest from "supertest";
import {web} from "../src/application/web";
import {logger} from "../src/application/logging";
import {ProductWithUnits} from "../src/model/product-model";
import {ProductUnitResponse} from "../src/model/product-unit-model";

let token: string;
let pramuniagaToken: string;
let testGroup: Group;
let testCategory: Category;
let testUnit: Unit;

beforeEach(async () => {
    await createTestUser();
    await createTestPramuniaga()
    await createTestGroup()
    await createTestCategory()
    await createManyTestUnit()
    token = await getTestToken()
    pramuniagaToken = await getPramuniagaToken()
    testGroup = await getTestGroup()
    testCategory = await getTestCategory()
    testUnit = await getTestUnit2()
})

afterEach(async () => {
    await removeAllTestUser()
    await removeAllTestGroups()
    await removeAllTestCategory()
    await removeAllTestUnits()
})

describe('POST /api/products', () => {
    afterEach(async () => {
        await removeAllTestProduct()
    })

    it('should be able to create new products', async () => {
        const result = await supertest(web)
            .post('/api/products')
            .set('Authorization', `Bearer ${token}`)
            .send({
                name: 'test',
                code: 'test',
                minimum_stock: 10,
                allow_sale_before_expired: 40,
                description: 'test',
                indication: 'test',
                contraindication: 'test',
                side_effects: 'test',
                content: 'test',
                dose: 'test',
                category_id: testCategory.id,
                group_id: testGroup.id,
                productUnits: [
                    {
                        unit_id: testUnit.id,
                        price: 500,
                        is_default: true
                    },
                    {
                        unit_id: (testUnit.id + 1),
                        price: 4500,
                        conversion_value: 10
                    },
                    {
                        unit_id: (testUnit.id + 2),
                        price: 40000,
                        conversion_value: 20
                    }
                ]
            });

        logger.info(result.body)
        console.log(JSON.stringify(result.body, null, 2));

        expect(result.status).toBe(201);
        expect(result.body.data.name).toBe('test');
        expect(result.body.data.code).toBe('test');
        expect(result.body.data.minimum_stock).toBe(10);
        expect(result.body.data.allow_sale_before_expired).toBe(40);
        expect(result.body.data.description).toBe('test');
        expect(result.body.data.indication).toBe('test');
        expect(result.body.data.contraindication).toBe('test');
        expect(result.body.data.side_effects).toBe('test');
        expect(result.body.data.content).toBe('test');
        expect(result.body.data.dose).toBe('test');
        expect(result.body.data.category_id).toBe(testCategory.id);
        expect(result.body.data.group_id).toBe(testGroup.id);
        expect(result.body.data.productUnits).toHaveLength(3);
        expect(result.body.data.productUnits[0].unit_id).toBe(testUnit.id);
        expect(result.body.data.productUnits[0].price).toBe(500);
        expect(result.body.data.productUnits[0].is_default).toBe(true);
        expect(result.body.data.productUnits[1].unit_id).toBe(testUnit.id + 1);
        expect(result.body.data.productUnits[1].price).toBe(4500);
        expect(result.body.data.productUnits[1].unitConversions[0].conversion_value).toBe(10);
        expect(result.body.data.productUnits[2].unit_id).toBe(testUnit.id + 2);
        expect(result.body.data.productUnits[2].price).toBe(40000);
        expect(result.body.data.productUnits[2].unitConversions[0].conversion_value).toBe(20);

    });

    it('should not be able to create new products if request is invalid', async () => {
        const result = await supertest(web)
            .post('/api/products')
            .set('Authorization', `Bearer ${token}`)
            .send({
                name: '',
                code: '',
                minimum_stock: 10,
                description: 'test',
                indication: 'test',
                contraindication: 'test',
                side_effects: 'test',
                content: 'test',
                dose: 'test',
                category_id: testCategory.id,
                group_id: testGroup.id,
                productUnits: [
                    {
                        unit_id: 1,
                        price: 500,
                        is_default: true
                    },
                    {
                        unit_id: 2,
                        price: 4500,
                        conversion_value: 10
                    },
                    {
                        unit_id: 3,
                        price: 40000,
                        conversion_value: 10
                    }
                ]
            });

        logger.info(result.body)

        expect(result.status).toBe(400)
        expect(result.body.errors).toBeDefined()
    });

    it('should not be able to create new products if code already exist', async () => {
        let result = await supertest(web)
            .post('/api/products')
            .set('Authorization', `Bearer ${token}`)
            .send({
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
                productUnits: [
                    {
                        unit_id: 1,
                        price: 500,
                        is_default: true
                    },
                    {
                        unit_id: 2,
                        price: 4500,
                        conversion_value: 10
                    },
                    {
                        unit_id: 3,
                        price: 40000,
                        conversion_value: 10
                    }
                ]
            });

        logger.info(result.body)

        expect(result.status).toBe(201)
        expect(result.body.data.name).toBe('test');
        expect(result.body.data.code).toBe('test');
        expect(result.body.data.minimum_stock).toBe(10);
        expect(result.body.data.description).toBe('test');
        expect(result.body.data.indication).toBe('test');
        expect(result.body.data.contraindication).toBe('test');
        expect(result.body.data.side_effects).toBe('test');
        expect(result.body.data.content).toBe('test');
        expect(result.body.data.dose).toBe('test');
        expect(result.body.data.category_id).toBe(testCategory.id);
        expect(result.body.data.group_id).toBe(testGroup.id);
        expect(result.body.data.productUnits).toHaveLength(3);

        result = await supertest(web)
            .post('/api/products')
            .set('Authorization', `Bearer ${token}`)
            .send({
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
                productUnits: [
                    {
                        unit_id: 1,
                        price: 500,
                        is_default: true
                    },
                    {
                        unit_id: 2,
                        price: 4500,
                        conversion_value: 10
                    },
                ]
            });

        expect(result.status).toBe(400)
        expect(result.body.errors).toBeDefined();
    });

    it('should not be able to create new products if token invalid', async () => {
        const result = await supertest(web)
            .post('/api/products')
            .set('Authorization', `Bearer token`)
            .send({
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
                productUnits: [
                    {
                        unit_id: 1,
                        price: 500,
                        is_default: true
                    },
                    {
                        unit_id: 2,
                        price: 4500,
                        conversion_value: 10
                    },
                    {
                        unit_id: 3,
                        price: 40000,
                        conversion_value: 10
                    }
                ]
            });

        logger.info(result.body)

        expect(result.status).toBe(401)
        expect(result.body.errors).toBeDefined()
    });

    it('should not be able to create new products if default value is not selected', async () => {
        const result = await supertest(web)
            .post('/api/products')
            .set('Authorization', `Bearer ${token}`)
            .send({
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
                productUnits: [
                    {
                        unit_id: 1,
                        price: 500,
                    },
                    {
                        unit_id: 2,
                        price: 4500,
                        conversion_value: 10
                    },
                    {
                        unit_id: 3,
                        price: 40000,
                        conversion_value: 10
                    }
                ]
            });

        logger.info(result.body)

        expect(result.status).toBe(400)
        expect(result.body.errors).toBeDefined()
    });

    it('should not be able to create new products if default value more than 1', async () => {
        const result = await supertest(web)
            .post('/api/products')
            .set('Authorization', `Bearer ${token}`)
            .send({
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
                productUnits: [
                    {
                        unit_id: 1,
                        price: 500,
                        is_default: true
                    },
                    {
                        unit_id: 2,
                        price: 4500,
                        conversion_value: 10,
                        is_default: true
                    },
                    {
                        unit_id: 3,
                        price: 40000,
                        conversion_value: 10
                    }
                ]
            });

        logger.info(result.body)

        expect(result.status).toBe(400)
        expect(result.body.errors).toBeDefined()
    });
})

describe('GET /api/products/:id', () => {
    let testProduct: ProductWithUnits;
    beforeEach(async () => {
        await createTestProduct()
        testProduct = await getTestProduct()
    })
    afterEach(async () => {
        await removeAllTestProduct()
    })

    it('should be able to get product data', async () => {
        logger.info(`Id ${testProduct.id}`)
        const result = await supertest(web)
            .get('/api/products/' + testProduct.id)
            .set('Authorization', `Bearer ${token}`)

        logger.info(JSON.stringify(result.body))
        console.log(JSON.stringify(result.body, null, 2));

        expect(result.status).toBe(200)
        expect(result.body.data.id).toBe(testProduct.id);
        expect(result.body.data.name).toBe(testProduct.name);
        expect(result.body.data.code).toBe(testProduct.code);
        expect(result.body.data.minimum_stock).toBe(testProduct.minimum_stock);
        expect(result.body.data.description).toBe(testProduct.description);
        expect(result.body.data.indication).toBe(testProduct.indication);
        expect(result.body.data.contraindication).toBe(testProduct.contraindication);
        expect(result.body.data.side_effects).toBe(testProduct.side_effects);
        expect(result.body.data.content).toBe(testProduct.content);
        expect(result.body.data.dose).toBe('test');
        expect(result.body.data.category_id).toBe(testProduct.category_id);
        expect(result.body.data.group_id).toBe(testProduct.group_id);
        expect(result.body.data.productUnits).toBeInstanceOf(Array);
        expect(result.body.data.productUnits.length).toBeGreaterThan(0);

        result.body.data.productUnits.forEach((unit: ProductUnitResponse, index: number) => {
            const testUnitData = testProduct.productUnits[index];
            expect(unit.id).toBe(testUnitData.id);
            expect(unit.unit_id).toBe(testUnitData.unit_id);
            expect(unit.price).toBe(testUnitData.price);
            expect(unit.is_default).toBe(testUnitData.is_default);

            expect(unit.unit).toBeDefined();
            expect(unit.unit?.id).toBe(testUnitData.unit?.id);
            expect(unit.unit?.name).toBe(testUnitData.unit?.name);

            if (unit.unitConversions) {
                unit.unitConversions.forEach((conversion) => {
                    // expect(conversion.toProductUnit).toBeDefined();
                    expect(conversion.conversion_value).toBeDefined();
                });
            }
        });

    });

    it('should return 404 if id not found', async () => {
        const result = await supertest(web)
            .get('/api/products/' + (testProduct.id + 100))
            .set('Authorization', `Bearer ${token}`)

        logger.info(result.body)

        expect(result.status).toBe(404)
        expect(result.body.errors).toBeDefined()
    });

    it('should not be able to get product if token is invalid', async () => {
        const result = await supertest(web)
            .get('/api/products/' + testProduct.id)
            .set('Authorization', `Bearer token`)

        logger.info(result.body)

        expect(result.status).toBe(401)
        expect(result.body.errors).toBeDefined()
    });

    it('should not be able to get product if token is not found', async () => {
        const result = await supertest(web)
            .get('/api/products/' + testProduct.id)

        logger.info(result.body)

        expect(result.status).toBe(401)
        expect(result.body.errors).toBeDefined()
    });

    it('should reject if user is forbidden', async () => {
        const result = await supertest(web)
            .get('/api/products/' + testProduct.id)
            .set('Authorization', `Bearer ${pramuniagaToken}`)

        logger.info(result.body)

        expect(result.status).toBe(403)
        expect(result.body.errors).toBeDefined()
    });

});

describe('DELETE /api/products/:id', () => {
    let testProduct: ProductWithUnits;
    beforeEach(async () => {
        await createTestProduct()
        testProduct = await getTestProduct()
    })
    afterEach(async () => {
        await removeAllTestProduct()
    })

    it('should be able to delete products', async () => {
        const result = await supertest(web)
            .delete('/api/products/' + testProduct.id)
            .set('Authorization', `Bearer ${token}`)

        logger.info(result.body)

        expect(result.status).toBe(200)
        expect(result.body.data).toBeTruthy()
    });

    it('should not be able to delete products if id not found', async () => {
        const result = await supertest(web)
            .delete('/api/products/' + (testProduct.id + 100))
            .set('Authorization', `Bearer ${token}`)

        logger.info(result.body)

        expect(result.status).toBe(404)
        expect(result.body.errors).toBeDefined()
    });

    it('should be able to delete products if token is invalid', async () => {
        const result = await supertest(web)
            .delete('/api/products/' + testProduct.id)
            .set('Authorization', `Bearer token`)

        logger.info(result.body)

        expect(result.status).toBe(401)
        expect(result.body.errors).toBeDefined()
    });

    it('should be able to delete products if token not found', async () => {
        const result = await supertest(web)
            .delete('/api/products/' + testProduct.id)

        logger.info(result.body)

        expect(result.status).toBe(401)
        expect(result.body.errors).toBeDefined()
    });

    it('should be able to delete products if user is forbidden', async () => {
        const result = await supertest(web)
            .delete('/api/products/' + testProduct.id)
            .set('Authorization', `Bearer ${pramuniagaToken}`)

        logger.info(result.body)

        expect(result.status).toBe(403)
        expect(result.body.errors).toBeDefined()
    });
});

describe('PUT /api/products/:id', () => {
    let testProduct: ProductWithUnits;
    beforeEach(async () => {
        await createTestProduct()
        testProduct = await getTestProduct()
    })
    afterEach(async () => {
        await removeAllTestProduct()
    })

    it('should be able to update products', async () => {
        const result = await supertest(web)
            .put('/api/products/' + testProduct.id)
            .set('Authorization', `Bearer ${token}`)
            .send({
                name: 'test1',
                code: 'test',
                minimum_stock: 30,
                allow_sale_before_expired: 40,
                description: 'test',
                indication: 'test',
                contraindication: 'test',
                side_effects: 'test',
                content: 'test',
                dose: 'test',
                category_id: testCategory.id,
                group_id: testGroup.id,
                productUnits: [
                    {
                        unit_id: testUnit.id,
                        price: 600,
                        is_default: true
                    },
                    {
                        unit_id: (testUnit.id + 2),
                        price: 4500,
                        conversion_value: 10
                    },
                    {
                        unit_id: (testUnit.id + 5),
                        price: 40000,
                        conversion_value: 12
                    }
                ]
            });

        console.log(JSON.stringify(result.body, null, 2));
        logger.info(result.body)

        expect(result.status).toBe(200)
        expect(result.body.data.name).toBe('test1');
        expect(result.body.data.code).toBe('test');
        expect(result.body.data.minimum_stock).toBe(30);
        expect(result.body.data.allow_sale_before_expired).toBe(40);
        expect(result.body.data.description).toBe('test');
        expect(result.body.data.indication).toBe('test');
        expect(result.body.data.contraindication).toBe('test');
        expect(result.body.data.side_effects).toBe('test');
        expect(result.body.data.content).toBe('test');
        expect(result.body.data.dose).toBe('test');
        expect(result.body.data.category_id).toBe(testCategory.id);
        expect(result.body.data.group_id).toBe(testGroup.id);
        expect(result.body.data.productUnits).toHaveLength(3);
        expect(result.body.data.productUnits[0].unit_id).toBe(testUnit.id);
        expect(result.body.data.productUnits[0].price).toBe(600);
        expect(result.body.data.productUnits[0].is_default).toBe(true);
        expect(result.body.data.productUnits[1].unit_id).toBe(testUnit.id + 2);
        expect(result.body.data.productUnits[1].price).toBe(4500);
        expect(result.body.data.productUnits[1].unitConversions[0].conversion_value).toBe(10);
        expect(result.body.data.productUnits[2].unit_id).toBe(testUnit.id + 5);
        expect(result.body.data.productUnits[2].price).toBe(40000);
        expect(result.body.data.productUnits[2].unitConversions[0].conversion_value).toBe(12);
    });

    it('should reject if request is invalid', async () => {
        const result = await supertest(web)
            .put('/api/products/' + testProduct.id)
            .set('Authorization', `Bearer ${token}`)
            .send({
                name: '',
                code: '',
                minimum_stock: 30,
                allow_sale_before_expired: 40,
                description: 'test',
                indication: 'test',
                contraindication: 'test',
                side_effects: 'test',
                content: 'test',
                dose: 'test',
                category_id: testCategory.id,
                group_id: testGroup.id,
                productUnits: [
                    {
                        unit_id: testUnit.id,
                        price: 600,
                        is_default: true
                    },
                    {
                        unit_id: (testUnit.id + 2),
                        price: 4500,
                        conversion_value: 10
                    },
                    {
                        unit_id: (testUnit.id + 5),
                        price: 40000,
                        conversion_value: 12
                    }
                ]
            });

        console.log(JSON.stringify(result.body, null, 2));
        logger.info(result.body)

        expect(result.status).toBe(400)
        expect(result.body.errors).toBeDefined()
    });

    it('should reject if product id not found', async () => {
        const result = await supertest(web)
            .put('/api/products/' + (testProduct.id + 100))
            .set('Authorization', `Bearer ${token}`)
            .send({
                name: 'test1',
                code: 'test',
                minimum_stock: 30,
                allow_sale_before_expired: 40,
                description: 'test',
                indication: 'test',
                contraindication: 'test',
                side_effects: 'test',
                content: 'test',
                dose: 'test',
                category_id: testCategory.id,
                group_id: testGroup.id,
                productUnits: [
                    {
                        unit_id: testUnit.id,
                        price: 600,
                        is_default: true
                    },
                    {
                        unit_id: (testUnit.id + 2),
                        price: 4500,
                        conversion_value: 10
                    },
                    {
                        unit_id: (testUnit.id + 5),
                        price: 40000,
                        conversion_value: 12
                    }
                ]
            });

        logger.info(result.body)

        expect(result.status).toBe(404)
        expect(result.body.errors).toBeDefined()
    });

    it('should return 401 if token is invalid', async () => {
        const result = await supertest(web)
            .put('/api/products/' + testProduct.id)
            .set('Authorization', `Bearer token`)
            .send({
                name: 'test1',
                code: 'test',
                minimum_stock: 30,
                allow_sale_before_expired: 40,
                description: 'test',
                indication: 'test',
                contraindication: 'test',
                side_effects: 'test',
                content: 'test',
                dose: 'test',
                category_id: testCategory.id,
                group_id: testGroup.id,
                productUnits: [
                    {
                        unit_id: testUnit.id,
                        price: 600,
                        is_default: true
                    },
                    {
                        unit_id: (testUnit.id + 2),
                        price: 4500,
                        conversion_value: 10
                    },
                    {
                        unit_id: (testUnit.id + 5),
                        price: 40000,
                        conversion_value: 12
                    }
                ]
            });

        logger.info(result.body)

        expect(result.status).toBe(401)
        expect(result.body.errors).toBeDefined()
    });

    it('should return 403 if user is forbidden', async () => {
        const result = await supertest(web)
            .put('/api/products/' + testProduct.id)
            .set('Authorization', `Bearer ${pramuniagaToken}`)
            .send({
                name: 'test1',
                code: 'test',
                minimum_stock: 30,
                allow_sale_before_expired: 40,
                description: 'test',
                indication: 'test',
                contraindication: 'test',
                side_effects: 'test',
                content: 'test',
                dose: 'test',
                category_id: testCategory.id,
                group_id: testGroup.id,
                productUnits: [
                    {
                        unit_id: testUnit.id,
                        price: 600,
                        is_default: true
                    },
                    {
                        unit_id: (testUnit.id + 2),
                        price: 4500,
                        conversion_value: 10
                    },
                    {
                        unit_id: (testUnit.id + 5),
                        price: 40000,
                        conversion_value: 12
                    }
                ]
            });

        console.log(JSON.stringify(result.body, null, 2));
        logger.info(result.body)

        expect(result.status).toBe(403)
        expect(result.body.errors).toBeDefined()
    });
});

describe('GET /api/products', () => {
    beforeEach(async () => {
        await createManyTestProduct()
    })
    afterEach(async () => {
        await removeAllTestProduct()
    })

    it('should be able to search without parameters', async () => {
        const result = await supertest(web)
            .get('/api/products')
            .set('Authorization', `Bearer ${token}`)

        logger.info(result.body)
        console.log(JSON.stringify(result.body, null, 2));

        expect(result.status).toBe(200)
        expect(result.body.data.length).toBe(10);
        expect(result.body.paging.page).toBe(1);
        expect(result.body.paging.total_page).toBe(2);
        expect(result.body.paging.total_item).toBe(14);
    });

    it('should be able to search page 2', async () => {
        const result = await supertest(web)
            .get('/api/products')
            .set('Authorization', `Bearer ${token}`)
            .query({
                page: 2
            })

        logger.info(result.body);

        expect(result.status).toBe(200);
        expect(result.body.data.length).toBe(4);
        expect(result.body.paging.page).toBe(2);
        expect(result.body.paging.total_page).toBe(2);
        expect(result.body.paging.total_item).toBe(14);
    });

    it('should be able to search with name parameters', async () => {
        const result = await supertest(web)
            .get('/api/products')
            .set('Authorization', `Bearer ${token}`)
            .query({
                name: 'test 1'
            })

        logger.info(result.body);

        expect(result.status).toBe(200);
        expect(result.body.data.length).toBe(6);
        expect(result.body.paging.page).toBe(1);
        expect(result.body.paging.total_page).toBe(1);
        expect(result.body.paging.total_item).toBe(6);
    });

    it('should be able to search with code parameters', async () => {
        const result = await supertest(web)
            .get('/api/products')
            .set('Authorization', `Bearer ${token}`)
            .query({
                code: 'test 1'
            })

        logger.info(result.body);

        expect(result.status).toBe(200);
        expect(result.body.data.length).toBe(6);
        expect(result.body.paging.page).toBe(1);
        expect(result.body.paging.total_page).toBe(1);
        expect(result.body.paging.total_item).toBe(6);
    });

    it('should be able to search with category_id parameters', async () => {
        const result = await supertest(web)
            .get('/api/products')
            .set('Authorization', `Bearer ${token}`)
            .query({
                category_id: testCategory.id
            })

        logger.info(result.body);

        expect(result.status).toBe(200);
        expect(result.body.data.length).toBe(10);
        expect(result.body.paging.page).toBe(1);
        expect(result.body.paging.total_page).toBe(2);
        expect(result.body.paging.total_item).toBe(14);
    });

    it('should be able to search with group_id parameters', async () => {
        const result = await supertest(web)
            .get('/api/products')
            .set('Authorization', `Bearer ${token}`)
            .query({
                group_id: testGroup.id
            })

        logger.info(result.body);

        expect(result.status).toBe(200);
        expect(result.body.data.length).toBe(10);
        expect(result.body.paging.page).toBe(1);
        expect(result.body.paging.total_page).toBe(2);
        expect(result.body.paging.total_item).toBe(14);
    });

    it('should be able to search with minimum stock parameters', async () => {
        const result = await supertest(web)
            .get('/api/products')
            .set('Authorization', `Bearer ${token}`)
            .query({
                minimum_stock: 30
            })

        logger.info(result.body);

        expect(result.status).toBe(200);
        expect(result.body.data.length).toBe(3);
        expect(result.body.paging.page).toBe(1);
        expect(result.body.paging.total_page).toBe(1);
        expect(result.body.paging.total_item).toBe(3);
    });

    it('should be able to search with allow sale before expired stock parameters', async () => {
        const result = await supertest(web)
            .get('/api/products')
            .set('Authorization', `Bearer ${token}`)
            .query({
                allow_sale_before_expired: 20
            })

        logger.info(result.body);

        expect(result.status).toBe(200);
        expect(result.body.data.length).toBe(5);
        expect(result.body.paging.page).toBe(1);
        expect(result.body.paging.total_page).toBe(1);
        expect(result.body.paging.total_item).toBe(5);
    });

})