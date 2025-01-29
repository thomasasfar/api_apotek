import {createTestSupplier, getTestSupplier, removeAllTestSupplier} from "./utils/supplier-util";
import {createTestUser, getTestToken, removeAllTestUser} from "./utils/user-util";
import {createTestCategory, removeAllTestCategory} from "./utils/category-util";
import {createTestGroup, removeAllTestGroups} from "./utils/group-util";
import {createManyTestUnit, getManyTestUnit, removeAllTestUnits} from "./utils/unit-util";
import {createManyTestProduct, getManyTestProduct, removeAllTestProduct} from "./utils/product-util";
import {createManyTestPurchase, removeAllTestPurchase} from "./utils/purchase-util";
import {Sale, Supplier, Unit} from "@prisma/client";
import {createManyTestSale, createTestSale, getTestSale, removeAllTestSales} from "./utils/sale-util";
import supertest from "supertest";
import {web} from "../src/application/web";
import {logger} from "../src/application/logging";
import {ProductWithUnits} from "../src/model/product-model";

let token: string;
let testSupplier: Supplier;
let testProduct: ProductWithUnits[];
let testUnit: Unit[];

beforeEach(async () => {
    await createTestUser();
    await createTestSupplier();
    await createTestCategory();
    await createTestGroup();
    await createManyTestUnit();
    await createManyTestProduct();
    await createManyTestPurchase()
    token = await getTestToken();
    testSupplier = await getTestSupplier();
    testProduct = await getManyTestProduct();
    testUnit = await getManyTestUnit()
});

afterEach(async () => {
    await removeAllTestPurchase()
    await removeAllTestProduct();
    await removeAllTestUnits();
    await removeAllTestGroups();
    await removeAllTestCategory();
    await removeAllTestSupplier();
    await removeAllTestUser();
});

describe('POST /api/sales', () => {
    afterEach(async () => {
        await removeAllTestSales()
    })
    it('should be able to create new sale', async () => {
        const result = await supertest(web)
            .post('/api/sales')
            .set('Authorization', `Bearer ${token}`)
            .send({
                total_payment: 100000,
                items: [
                    {
                        product_id: testProduct[0].id,
                        quantity: 2,
                        product_unit_id: testProduct[0].productUnits[0].id,
                    },
                    {
                        product_id: testProduct[1].id,
                        quantity: 4,
                        product_unit_id: testProduct[1].productUnits[1].id,
                    }
                ]
            })

        logger.info(result.body)

        expect(result.status).toBe(201);
        expect(result.body.data.total_payment).toBe(100000)
    });

    it('should return 400 if request is invalid', async () => {
        const result = await supertest(web)
            .post('/api/sales')
            .set('Authorization', `Bearer ${token}`)
            .send({
                total_payment: 50000,
                items: [
                    {
                        product_id: testProduct[0].id,
                        quantity: -1,
                        product_unit_id: testProduct[0].productUnits[0].id,
                    },
                ],
            })

        logger.info(result.body)

        expect(result.status).toBe(400)
        expect(result.body.errors).toBeDefined()
    });

    it('should return 400 if stock is insufficient', async () => {
        const result = await supertest(web)
            .post('/api/sales')
            .set('Authorization', `Bearer ${token}`)
            .send({
                total_payment: 50000,
                items: [
                    {
                        product_id: testProduct[0].id,
                        quantity: 100000,
                        product_unit_id: testProduct[0].productUnits[0].id,
                    },
                ],
            })

        logger.info(result.body)

        expect(result.status).toBe(400)
        expect(result.body.errors).toBeDefined()
    });

    it('should create sale successfully with exact payment', async () => {
        const totalPrice =
            testProduct[0].productUnits[0].price * 2 +
            testProduct[1].productUnits[1].price * 4;

        const result = await supertest(web)
            .post('/api/sales')
            .set('Authorization', `Bearer ${token}`)
            .send({
                total_payment: totalPrice,
                items: [
                    {
                        product_id: testProduct[0].id,
                        quantity: 2,
                        product_unit_id: testProduct[0].productUnits[0].id,
                    },
                    {
                        product_id: testProduct[1].id,
                        quantity: 4,
                        product_unit_id: testProduct[1].productUnits[1].id,
                    },
                ],
            });

        logger.info(result.body);

        expect(result.status).toBe(201);
        expect(result.body.data.total_payment).toBe(totalPrice);
        expect(result.body.data.change).toBe(0);
    });

    it('should create sale successfully with change', async () => {
        const totalPrice =
            testProduct[0].productUnits[0].price * 2 +
            testProduct[1].productUnits[1].price * 4;

        const result = await supertest(web)
            .post('/api/sales')
            .set('Authorization', `Bearer ${token}`)
            .send({
                total_payment: totalPrice + 5000,
                items: [
                    {
                        product_id: testProduct[0].id,
                        quantity: 2,
                        product_unit_id: testProduct[0].productUnits[0].id,
                    },
                    {
                        product_id: testProduct[1].id,
                        quantity: 4,
                        product_unit_id: testProduct[1].productUnits[1].id,
                    },
                ],
            });

        logger.info(result.body);

        expect(result.status).toBe(201);
        expect(result.body.data.total_payment).toBe(totalPrice + 5000);
        expect(result.body.data.change).toBe(5000);
    });

    it('should return 401 if token is invalid', async () => {
        const result = await supertest(web)
            .post('/api/sales')
            .set('Authorization', `Bearer token`)
            .send({
                total_payment: 100000,
                items: [
                    {
                        product_id: testProduct[0].id,
                        quantity: 2,
                        product_unit_id: testProduct[0].productUnits[0].id,
                    },
                ],
            });

        logger.info(result.body);

        expect(result.status).toBe(401);
        expect(result.body.errors).toBeDefined();
    });

    it('should return 404 if product is not found', async () => {
        const result = await supertest(web)
            .post('/api/sales')
            .set('Authorization', `Bearer ${token}`)
            .send({
                total_payment: 100000,
                items: [
                    {
                        product_id: 10000, // ID tidak valid
                        quantity: 2,
                        product_unit_id: testProduct[0].productUnits[0].id,
                    },
                ],
            });

        logger.info(result.body);

        expect(result.status).toBe(404);
        expect(result.body.errors).toBeDefined();
    });

});

describe('GET /api/sales/:id', () => {
    let testSale: Sale;
    beforeEach(async () => {
        await createTestSale()
        testSale = await getTestSale()
    })
    afterEach(async () => {
        await removeAllTestSales()
    })

    it('should be able to get sale', async () => {
        const result = await supertest(web)
            .get('/api/sales/' + testSale.id)
            .set('Authorization', `Bearer ${token}`)

        logger.info(result.body);
        console.log(JSON.stringify(result.body, null, 2))

        expect(result.status).toBe(200)
        expect(result.body.data).toBeDefined()
    });

    it('should return 404 if sale not found', async () => {
        const result = await supertest(web)
            .get('/api/sales/' + (testSale.id + 100))
            .set('Authorization', `Bearer ${token}`)

        logger.info(result.body);

        expect(result.status).toBe(404)
        expect(result.body.errors).toBeDefined()
    });
});

describe('GET /api/sales', () => {
    beforeEach(async () => {
        await createManyTestSale()
    })
    afterEach(async () => {
        await removeAllTestSales()
    })

    it('should be able to search without parameters', async () => {
        const result = await supertest(web)
            .get('/api/sales')
            .set('Authorization', `Bearer ${token}`)

        logger.info(result.body)

        expect(result.status).toBe(200)
        expect(result.body.data.length).toBe(10)
        expect(result.body.paging.page).toBe(1)
        expect(result.body.paging.total_page).toBe(2)
        expect(result.body.paging.total_item).toBe(15)
    });

    it('should be able to search page 2', async () => {
        const result = await supertest(web)
            .get('/api/sales')
            .set('Authorization', `Bearer ${token}`)
            .query({
                page: 2
            })

        logger.info(result.body)

        expect(result.status).toBe(200)
        expect(result.body.data.length).toBe(5)
        expect(result.body.paging.page).toBe(2)
        expect(result.body.paging.total_page).toBe(2)
        expect(result.body.paging.total_item).toBe(15)
    });

    it('should be able to search with size', async () => {
        const result = await supertest(web)
            .get('/api/sales')
            .set('Authorization', `Bearer ${token}`)
            .query({
                size: 5
            })

        logger.info(result.body)

        expect(result.status).toBe(200)
        expect(result.body.data.length).toBe(5)
        expect(result.body.paging.page).toBe(1)
        expect(result.body.paging.total_page).toBe(3)
        expect(result.body.paging.total_item).toBe(15)
    });

    it('should be able to search with size and page', async () => {
        const result = await supertest(web)
            .get('/api/sales')
            .set('Authorization', `Bearer ${token}`)
            .query({
                size: 5,
                page: 2
            })

        logger.info(result.body)

        expect(result.status).toBe(200)
        expect(result.body.data.length).toBe(5)
        expect(result.body.paging.page).toBe(2)
        expect(result.body.paging.total_page).toBe(3)
        expect(result.body.paging.total_item).toBe(15)
    });

    it('should be able to search with month parameters', async () => {
        let result = await supertest(web)
            .get('/api/sales')
            .set('Authorization', `Bearer ${token}`)
            .query({
                month: '2025-1'
            })

        logger.info(result.body)

        expect(result.status).toBe(200)
        expect(result.body.data.length).toBe(10)
        expect(result.body.paging.page).toBe(1)
        expect(result.body.paging.total_page).toBe(2)
        expect(result.body.paging.total_item).toBe(15)

        result = await supertest(web)
            .get('/api/sales')
            .set('Authorization', `Bearer ${token}`)
            .query({
                month: '2024-1'
            })

        logger.info(result.body)

        expect(result.status).toBe(200)
        expect(result.body.data.length).toBe(0)
        expect(result.body.paging.page).toBe(1)
        expect(result.body.paging.total_page).toBe(0)
        expect(result.body.paging.total_item).toBe(0)
    });

    it('should be able to search with date range', async () => {
        let result = await supertest(web)
            .get('/api/sales')
            .set('Authorization', `Bearer ${token}`)
            .query({
                start_date: '2025-01-29',
                end_date: '2025-01-31',
            })

        logger.info(result.body)

        expect(result.status).toBe(200)
        expect(result.body.data.length).toBe(10)
        expect(result.body.paging.page).toBe(1)
        expect(result.body.paging.total_page).toBe(2)
        expect(result.body.paging.total_item).toBe(15)

        result = await supertest(web)
            .get('/api/sales')
            .set('Authorization', `Bearer ${token}`)
            .query({
                start_date: '2024-01-25',
                end_date: '2024-01-26',
            })

        logger.info(result.body)

        expect(result.status).toBe(200)
        expect(result.body.data.length).toBe(0)
        expect(result.body.paging.page).toBe(1)
        expect(result.body.paging.total_page).toBe(0)
        expect(result.body.paging.total_item).toBe(0)
    });

});