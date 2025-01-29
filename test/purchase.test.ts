import {Supplier} from "@prisma/client";
import {createTestTTF, createTestUser, getTestToken, getTTFToken, removeAllTestUser} from "./utils/user-util";
import {createTestSupplier, getTestSupplier, removeAllTestSupplier} from "./utils/supplier-util";
import {createTestCategory, removeAllTestCategory} from "./utils/category-util";
import {createTestGroup, removeAllTestGroups} from "./utils/group-util";
import {createManyTestUnit, removeAllTestUnits} from "./utils/unit-util";
import {createManyTestProduct, getManyTestProduct, removeAllTestProduct} from "./utils/product-util";
import {
    createManyTestPurchase,
    createTestPurchase,
    getTestPurchase,
    removeAllTestPurchase
} from "./utils/purchase-util";
import {logger} from "../src/application/logging";
import supertest from "supertest";
import {web} from "../src/application/web";
import {ProductWithUnits} from "../src/model/product-model";
import {PurchaseWithDetail} from "../src/model/purchase-model";

let token: string;
let ttfToken: string;
let testSupplier: Supplier;
let testProduct: ProductWithUnits[];

beforeEach(async () => {
    await createTestUser();
    await createTestTTF()
    await createTestSupplier();
    await createTestCategory();
    await createTestGroup();
    await createManyTestUnit();
    await createManyTestProduct();
    token = await getTestToken();
    ttfToken = await getTTFToken()
    testSupplier = await getTestSupplier();
    testProduct = await getManyTestProduct();
});

afterEach(async () => {
    await removeAllTestProduct();
    await removeAllTestUnits();
    await removeAllTestGroups();
    await removeAllTestCategory();
    await removeAllTestSupplier();
    await removeAllTestUser();
});

describe('POST /api/purchases', () => {
    afterEach(async () => {
        await removeAllTestPurchase();
    });

    it('should be able to create a purchase', async () => {
        logger.info(`product_unit_id ${testProduct[0].productUnits[0].id}`);
        const result = await supertest(web)
            .post('/api/purchases')
            .set('Authorization', `Bearer ${token}`)
            .send({
                code: 'test',
                supplier_id: testSupplier.id,
                purchase_date: '2025-01-16',
                note: 'Pembelian stok baru',
                items: [
                    {
                        product_id: testProduct[0].id,
                        product_unit_id: testProduct[0].productUnits[1].id,
                        amount: 10,
                        price: 5000,
                        batch_number: 'test1',
                        expired_date: '2025-12-31'
                    },
                    {
                        product_id: testProduct[1].id,
                        product_unit_id: testProduct[1].productUnits[2].id,
                        amount: 20,
                        price: 7000,
                        batch_number: 'test2',
                        expired_date: '2026-01-15'
                    }
                ]
            });

        logger.info(result.body);
        console.log(JSON.stringify(result.body, null, 2));

        expect(result.status).toBe(201);
        expect(result.body).toHaveProperty('data');
        const {data} = result.body;

        expect(data).toMatchObject({
            code: 'test',
            supplier_id: testSupplier.id,
            user_id: expect.any(Number),
            purchase_date: '2025-01-16T00:00:00.000Z',
            note: 'Pembelian stok baru',
            created_at: expect.any(String),
            updated_at: expect.any(String),
        });

        expect(data.purchaseDetails).toHaveLength(2);

        expect(data.purchaseDetails[0]).toMatchObject({
            purchase_id: data.id,
            stock_id: expect.any(Number),
            amount: 20,
            price: 7000,
            product_unit_id: testProduct[1].productUnits[2].id,
            stock: {
                id: expect.any(Number),
                product_id: testProduct[1].id,
                batch_number: 'test2',
                expired_date: '2026-01-15T00:00:00.000Z',
                quantity: 2000,
                created_at: expect.any(String),
                updated_at: expect.any(String),
            },
            productUnit: {
                id: testProduct[1].productUnits[2].id,
                unit_id: expect.any(Number),
                price: 80000,
                is_default: false,
                is_base: false,
                unit: {
                    id: expect.any(Number),
                    name: 'test 3',
                },
            },
        });

        expect(data.purchaseDetails[1]).toMatchObject({
            purchase_id: data.id,
            stock_id: expect.any(Number),
            amount: 10,
            price: 5000,
            product_unit_id: testProduct[0].productUnits[1].id,
            stock: {
                id: expect.any(Number),
                product_id: testProduct[0].id,
                batch_number: 'test1',
                expired_date: '2025-12-31T00:00:00.000Z',
                quantity: 100,
                created_at: expect.any(String),
                updated_at: expect.any(String),
            },
            productUnit: {
                id: testProduct[0].productUnits[1].id,
                unit_id: expect.any(Number),
                price: 4500,
                is_default: false,
                is_base: false,
                unit: {
                    id: expect.any(Number),
                    name: 'test 2',
                },
            },
        });
    });

    it('should not be able to create a new purchase if request is invalid', async () => {
        const result = await supertest(web)
            .post('/api/purchases')
            .set('Authorization', `Bearer ${token}`)
            .send({
                code: '',
                supplier_id: testSupplier.id,
                purchase_date: '',
                note: '',
                items: [
                    {
                        product_id: testProduct[0].id,
                        product_unit_id: testProduct[0].productUnits[1].id,
                        amount: 10,
                        price: 5000,
                        batch_number: 'test1',
                        expired_date: '2025-12-31'
                    },
                    {
                        product_id: testProduct[1].id,
                        product_unit_id: testProduct[1].productUnits[2].id,
                        amount: 20,
                        price: 7000,
                        batch_number: 'test2',
                        expired_date: '2026-01-15'
                    }
                ]
            });

        logger.info(result.body);

        expect(result.status).toBe(400);
        expect(result.body.errors).toBeDefined();
    });

    it('should reject if the purchase with same code from the same supplier', async () => {
        let result = await supertest(web)
            .post('/api/purchases')
            .set('Authorization', `Bearer ${token}`)
            .send({
                code: 'test',
                supplier_id: testSupplier.id,
                purchase_date: '2025-01-16',
                note: 'Pembelian stok baru',
                items: [
                    {
                        product_id: testProduct[0].id,
                        product_unit_id: testProduct[0].productUnits[1].id,
                        amount: 10,
                        price: 5000,
                        batch_number: 'test1',
                        expired_date: '2025-12-31'
                    },
                    {
                        product_id: testProduct[1].id,
                        product_unit_id: testProduct[1].productUnits[2].id,
                        amount: 20,
                        price: 7000,
                        batch_number: 'test2',
                        expired_date: '2026-01-15'
                    }
                ]
            });

        logger.info(result.body);

        result = await supertest(web)
            .post('/api/purchases')
            .set('Authorization', `Bearer ${token}`)
            .send({
                code: 'test',
                supplier_id: testSupplier.id,
                purchase_date: '2025-01-16',
                note: 'Pembelian stok 2',
                items: [
                    {
                        product_id: testProduct[0].id,
                        product_unit_id: testProduct[0].productUnits[1].id,
                        amount: 10,
                        price: 5000,
                        batch_number: 'test1',
                        expired_date: '2025-12-31'
                    },
                    {
                        product_id: testProduct[1].id,
                        product_unit_id: testProduct[1].productUnits[2].id,
                        amount: 20,
                        price: 7000,
                        batch_number: 'test2',
                        expired_date: '2026-01-15'
                    }
                ]
            });

        logger.info(result.body);

        expect(result.status).toBe(400);
        expect(result.body.errors).toBeDefined();
    });

    it('should return 401 if token is invalid', async () => {
        const result = await supertest(web)
            .post('/api/purchases')
            .set('Authorization', `Bearer token`)
            .send({
                code: 'test',
                supplier_id: testSupplier.id,
                purchase_date: '2025-01-16',
                note: 'Pembelian stok baru',
                items: [
                    {
                        product_id: testProduct[0].id,
                        product_unit_id: testProduct[0].productUnits[1].id,
                        amount: 10,
                        price: 5000,
                        batch_number: 'test1',
                        expired_date: '2025-12-31'
                    },
                    {
                        product_id: testProduct[1].id,
                        product_unit_id: testProduct[1].productUnits[2].id,
                        amount: 20,
                        price: 7000,
                        batch_number: 'test2',
                        expired_date: '2026-01-15'
                    }
                ]
            });

        logger.info(result.body);

        expect(result.status).toBe(401);
        expect(result.body.errors).toBeDefined();
    });

    it('should return 403 if user is forbidden', async () => {
        const result = await supertest(web)
            .post('/api/purchases')
            .set('Authorization', `Bearer ${ttfToken}`)
            .send({
                code: 'test',
                supplier_id: testSupplier.id,
                purchase_date: '2025-01-16',
                note: 'Pembelian stok baru',
                items: [
                    {
                        product_id: testProduct[0].id,
                        product_unit_id: testProduct[0].productUnits[1].id,
                        amount: 10,
                        price: 5000,
                        batch_number: 'test1',
                        expired_date: '2025-12-31'
                    },
                    {
                        product_id: testProduct[1].id,
                        product_unit_id: testProduct[1].productUnits[2].id,
                        amount: 20,
                        price: 7000,
                        batch_number: 'test2',
                        expired_date: '2026-01-15'
                    }
                ]
            });

        logger.info(result.body);

        expect(result.status).toBe(403);
        expect(result.body.errors).toBeDefined();
    });
});

describe('GET /api/purchases/:id', () => {
    let testPurchase: PurchaseWithDetail;

    beforeEach(async () => {
        await createTestPurchase();
        testPurchase = await getTestPurchase();
    });

    afterEach(async () => {
        await removeAllTestPurchase();
    });

    it('should be able to get purchase', async () => {
        const result = await supertest(web)
            .get('/api/purchases/' + testPurchase.id) // Perbaiki URL
            .set('Authorization', `Bearer ${token}`);

        logger.info(result.body);
        console.log(JSON.stringify(result.body, null, 2));

        // Assertions
        expect(result.status).toBe(200);
        expect(result.body).toHaveProperty('data');

        const {data} = result.body;

        // Validasi data utama dari purchase
        expect(data).toMatchObject({
            id: testPurchase.id,
            code: testPurchase.code,
            supplier_id: testPurchase.supplier_id,
            user_id: testPurchase.user_id,
            purchase_date: testPurchase.purchase_date.toISOString(),
            note: testPurchase.note,
            created_at: expect.any(String),
            updated_at: expect.any(String),
        });

        // Validasi purchaseDetails
        expect(data.purchaseDetails).toHaveLength(testPurchase.purchaseDetails.length);

        // Loop dan validasi setiap purchaseDetail
        for (let i = 0; i < testPurchase.purchaseDetails.length; i++) {
            const expectedDetail = testPurchase.purchaseDetails[i];
            const actualDetail = data.purchaseDetails[i];

            expect(actualDetail).toMatchObject({
                purchase_id: testPurchase.id,
                stock_id: expectedDetail.stock.id,
                amount: expectedDetail.amount,
                price: expectedDetail.price,
                product_unit_id: expectedDetail.productUnit.id,
            });

            // Validasi stock terkait
            expect(actualDetail.stock).toMatchObject({
                id: expectedDetail.stock.id,
                product_id: expectedDetail.stock.product_id,
                batch_number: expectedDetail.stock.batch_number,
                expired_date: expectedDetail.stock.expired_date?.toISOString(),
                quantity: expectedDetail.stock.quantity,
                created_at: expect.any(String),
                updated_at: expect.any(String),
            });

            // Validasi productUnit terkait
            expect(actualDetail.productUnit).toMatchObject({
                id: expectedDetail.productUnit.id,
                unit_id: expectedDetail.productUnit.unit.id,
                price: expectedDetail.productUnit.price,
                is_default: expectedDetail.productUnit.is_default,
                is_base: expectedDetail.productUnit.is_base,
                unit: {
                    id: expectedDetail.productUnit.unit.id,
                    name: expectedDetail.productUnit.unit.name,
                },
            });
        }
    });

    it('should return 404 if purchase not found', async () => {
        const result = await supertest(web)
            .get('/api/purchases/' + (testPurchase.id + 100))
            .set('Authorization', `Bearer ${token}`);

        logger.info(result.body);

        expect(result.status).toBe(404);
        expect(result.body.errors).toBeDefined();
    });

    it('should return 401 if token is invalid', async () => {
        const result = await supertest(web)
            .get('/api/purchases/' + testPurchase.id)
            .set('Authorization', `Bearer token`);

        logger.info(result.body);

        expect(result.status).toBe(401);
        expect(result.body.errors).toBeDefined();
    });
});

describe('GET /api/purchases', () => {
    beforeEach(async () => {
        await createManyTestPurchase()
    })
    afterEach(async () => {
        await removeAllTestPurchase()
    })

    it('should be able to search user without parameters', async () => {
        const result = await supertest(web)
            .get('/api/purchases')
            .set('Authorization', `Bearer ${token}`);

        logger.info(result.body);

        expect(result.status).toBe(200);
        expect(result.body.data.length).toBe(10);
        expect(result.body.paging.page).toBe(1);
        expect(result.body.paging.total_page).toBe(2);
        expect(result.body.paging.total_item).toBe(15);
    });

    it('should be able to search purchase in page 2', async () => {
        const result = await supertest(web)
            .get('/api/purchases')
            .set('Authorization', `Bearer ${token}`)
            .query({
                page: 2
            });

        logger.info(result.body);

        expect(result.status).toBe(200);
        expect(result.body.data.length).toBe(5);
        expect(result.body.paging.page).toBe(2);
        expect(result.body.paging.total_page).toBe(2);
        expect(result.body.paging.total_item).toBe(15);
    });

    it('should be able to search purchase with code parameters', async () => {
        const result = await supertest(web)
            .get('/api/purchases')
            .set('Authorization', `Bearer ${token}`)
            .query({
                code: 'test-1'
            });

        logger.info(result.body);

        expect(result.status).toBe(200);
        expect(result.body.data.length).toBe(7);
        expect(result.body.paging.page).toBe(1);
        expect(result.body.paging.total_page).toBe(1);
        expect(result.body.paging.total_item).toBe(7);
    });

    it('should be able to search purchase with month parameters', async () => {
        const result = await supertest(web)
            .get('/api/purchases')
            .set('Authorization', `Bearer ${token}`)
            .query({
                month: '2025-1'
            });

        logger.info(result.body);

        expect(result.status).toBe(200);
        expect(result.body.data.length).toBe(10);
        expect(result.body.paging.page).toBe(1);
        expect(result.body.paging.total_page).toBe(2);
        expect(result.body.paging.total_item).toBe(15);
    });
});