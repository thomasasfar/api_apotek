import {createTestSupplier, getTestSupplier, removeAllTestSupplier} from "./utils/supplier-util";
import {createTestUser, getTestToken, removeAllTestUser} from "./utils/user-util";
import {createTestCategory, removeAllTestCategory} from "./utils/category-util";
import {createTestGroup, removeAllTestGroups} from "./utils/group-util";
import {createManyTestUnit, removeAllTestUnits} from "./utils/unit-util";
import {createManyTestProduct, getManyTestProduct, removeAllTestProduct} from "./utils/product-util";
import {Product, Supplier} from "@prisma/client";
import supertest from "supertest";
import {createManyTestPurchase, removeAllTestPurchase} from "./utils/purchase-util";
import {web} from "../src/application/web";
import {logger} from "../src/application/logging";

let token: string;
let testSupplier: Supplier;
let testProduct: Product[];

beforeEach(async () => {
    await createTestUser();
    await createTestSupplier();
    await createTestCategory();
    await createTestGroup();
    await createManyTestUnit();
    await createManyTestProduct();
    token = await getTestToken();
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

describe('GET /api/stocks', () => {
    beforeEach(async () => {
        await createManyTestPurchase();
    });
    afterEach(async () => {
        await removeAllTestPurchase();
    });

    it('should be able to search stocks without parameters', async () => {
        const result = await supertest(web)
            .get('/api/stocks')
            .set('Authorization', `Bearer ${token}`);

        logger.info(result.body);

        expect(result.status).toBe(200);
        expect(result.body.data.length).toBe(10);
        expect(result.body.paging.page).toBe(1);
        expect(result.body.paging.total_page).toBe(3);
        expect(result.body.paging.total_item).toBe(30);
    });

    it('should be able to search stocks in page 2', async () => {
        const result = await supertest(web)
            .get('/api/stocks')
            .set('Authorization', `Bearer ${token}`)
            .query({
                page: 2
            });

        logger.info(result.body);

        expect(result.status).toBe(200);
        expect(result.body.data.length).toBe(10);
        expect(result.body.paging.page).toBe(2);
        expect(result.body.paging.total_page).toBe(3);
        expect(result.body.paging.total_item).toBe(30);
    });

    it('should be able to search stocks with batch number', async () => {
        const result = await supertest(web)
            .get('/api/stocks')
            .set('Authorization', `Bearer ${token}`)
            .query({
                batch_number: 'BATCH12345'
            });

        logger.info(result.body);

        expect(result.status).toBe(200);
        expect(result.body.data.length).toBe(10);
        expect(result.body.paging.page).toBe(1);
        expect(result.body.paging.total_page).toBe(2);
        expect(result.body.paging.total_item).toBe(15);
    });

    it('should be able to search stocks with product name', async () => {
        const result = await supertest(web)
            .get('/api/stocks')
            .set('Authorization', `Bearer ${token}`)
            .query({
                product: 'test 1'
            });

        logger.info(result.body);

        expect(result.status).toBe(200);
        expect(result.body.data.length).toBe(10);
        expect(result.body.paging.page).toBe(1);
        expect(result.body.paging.total_page).toBe(2);
        expect(result.body.paging.total_item).toBe(14);
    });

    it('should be able to search stocks with before expired', async () => {
        const result = await supertest(web)
            .get('/api/stocks')
            .set('Authorization', `Bearer ${token}`)
            .query({
                before_expired: '30'
            });

        logger.info(result.body);

        expect(result.status).toBe(200);
        expect(result.body.data.length).toBe(0);
        expect(result.body.paging.page).toBe(1);
        expect(result.body.paging.total_page).toBe(0);
        expect(result.body.paging.total_item).toBe(0);
    });
});

