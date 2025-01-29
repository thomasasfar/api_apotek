import {
    createTestPramuniaga,
    createTestUser,
    getPramuniagaToken,
    getTestToken,
    removeAllTestUser
} from "./utils/user-util";
import {
    createManyTestSupplier,
    createTestSupplier,
    getTestSupplier,
    removeAllTestSupplier
} from "./utils/supplier-util";
import supertest from "supertest";
import {web} from "../src/application/web";
import {logger} from "../src/application/logging";

let token: string;
let pramuniagaToken: string;

describe('POST /api/suppliers', () => {

    beforeEach(async () => {
        await createTestUser()
        await createTestPramuniaga()
        token = await getTestToken()
        pramuniagaToken = await getPramuniagaToken()
    })

    afterEach(async () => {
        await removeAllTestUser()
        await removeAllTestSupplier()
    })

    it('should not be able to post data if request is invalid', async () => {
        const result = await supertest(web)
            .post('/api/suppliers')
            .set('Authorization', `Bearer ${token}`)
            .send({
                name: '',
                address: '',
                email: '',
                phone: '',
                npwp: ''
            })

        expect(result.status).toBe(400);
        expect(result.body.errors).toBeDefined();
    })

    it('should be able to post data', async () => {
        const result = await supertest(web)
            .post('/api/suppliers')
            .set('Authorization', `Bearer ${token}`)
            .send({
                name: 'test',
                address: 'test',
                email: 'test@test.com',
                phone: '081212121313',
                npwp: '01.234.567.8-912.345',
            })

        expect(result.status).toBe(201)
        expect(result.body.data.name).toBe('test')
        expect(result.body.data.address).toBe('test')
        expect(result.body.data.email).toBe('test@test.com')
        expect(result.body.data.phone).toBe('081212121313')
        expect(result.body.data.npwp).toBe('01.234.567.8-912.345')
    });

    it('should not be able to post data if its not admin', async () => {
        const result = await supertest(web)
            .post('/api/suppliers')
            .set('Authorization', `Bearer ${pramuniagaToken}`)
            .send({
                name: 'test',
                address: 'test',
                email: 'test@test.com',
                phone: '081212121313',
                npwp: '01.234.567.8-912.345',
            })

        logger.info(result.body)

        expect(result.status).toBe(403)
        expect(result.body.errors).toBeDefined();
    })

    it('should not be able to post data if there is no token', async () => {
        const result = await supertest(web)
            .post('/api/suppliers')
            .send({
                name: 'test',
                address: 'test',
                email: 'test@test.com',
                phone: '081212121313',
                npwp: '01.234.567.8-912.345',
            })

        logger.info(result.body)

        expect(result.status).toBe(401)
        expect(result.body.errors).toBeDefined();
    })
})

describe('PUT /api/suppliers/:id', function () {
    beforeEach(async () => {
        await createTestUser()
        await createTestPramuniaga()
        token = await getTestToken()
        pramuniagaToken = await getPramuniagaToken()
    })

    afterEach(async () => {
        await removeAllTestUser()
    })

    beforeEach(async () => {
        await createTestSupplier()
    })

    afterEach(async () => {
        await removeAllTestSupplier()
    })

    it('should not be able to put data if request is invalid', async () => {
        const testSupplier = await getTestSupplier()

        const result = await supertest(web)
            .put('/api/suppliers/' + testSupplier.id)
            .set('Authorization', `Bearer ${token}`)
            .send({
                name: '',
                address: '',
                email: '',
                phone: '',
                npwp: ''
            })

        logger.info(result.body)

        expect(result.status).toBe(400);
        expect(result.body.errors).toBeDefined();
    })

    it('should be able to put data', async () => {
        const testSupplier = await getTestSupplier()

        const result = await supertest(web)
            .put('/api/suppliers/' + testSupplier.id)
            .set('Authorization', `Bearer ${token}`)
            .send({
                name: 'test123',
                address: 'test123',
                email: 'test123@test.com',
                phone: '081212121414',
                npwp: '01.234.567.8-912.346',
            })

        expect(result.status).toBe(200)
        expect(result.body.data.name).toBe('test123')
        expect(result.body.data.address).toBe('test123')
        expect(result.body.data.email).toBe('test123@test.com')
        expect(result.body.data.phone).toBe('081212121414')
        expect(result.body.data.npwp).toBe('01.234.567.8-912.346')
    })

    it('should not be able to put data if not admin', async () => {
        const testSupplier = await getTestSupplier()

        const result = await supertest(web)
            .put('/api/suppliers/' + testSupplier.id)
            .set('Authorization', `Bearer ${pramuniagaToken}`)
            .send({
                name: 'test123',
                address: 'test123',
                email: 'test123@test.com',
                phone: '081212121414',
                npwp: '01.234.567.8-912.346',
            })

        expect(result.status).toBe(403)
        expect(result.body.errors).toBeDefined();
    })

    it('should not be able to put data if there is no token', async () => {
        const testSupplier = await getTestSupplier()

        const result = await supertest(web)
            .put('/api/suppliers/' + testSupplier.id)
            .send({
                name: 'test123',
                address: 'test123',
                email: 'test123@test.com',
                phone: '081212121414',
                npwp: '01.234.567.8-912.346',
            })

        expect(result.status).toBe(401)
        expect(result.body.errors).toBeDefined();
    })

    it('should not be able to put data if supplier not found', async () => {
        const testSupplier = await getTestSupplier()

        const result = await supertest(web)
            .put('/api/suppliers/' + (testSupplier.id + 100))
            .set('Authorization', `Bearer ${token}`)
            .send({
                name: 'test123',
                address: 'test123',
                email: 'test123@test.com',
                phone: '081212121414',
                npwp: '01.234.567.8-912.346',
            })

        logger.info(result.body)

        expect(result.status).toBe(404)
        expect(result.body.errors).toBeDefined();
    })
})

describe('GET /api/suppliers/:id', () => {

    beforeEach(async () => {
        await createTestUser()
        await createTestPramuniaga()
        token = await getTestToken()
        pramuniagaToken = await getPramuniagaToken()
        await createTestSupplier()
    })

    afterEach(async () => {
        await removeAllTestUser()
        await removeAllTestSupplier()
    })

    it('should be able to get supplier', async () => {
        const testSupplier = await getTestSupplier()

        const result = await supertest(web)
            .get('/api/suppliers/' + testSupplier.id)
            .set('Authorization', `Bearer ${token}`)

        logger.info(result.body)

        expect(result.status).toBe(200)
        expect(result.body.data.name).toBe(testSupplier.name)
        expect(result.body.data.address).toBe(testSupplier.address)
        expect(result.body.data.email).toBe(testSupplier.email)
        expect(result.body.data.phone).toBe(testSupplier.phone)
        expect(result.body.data.npwp).toBe(testSupplier.npwp)
    });

    it('should not be able to get supplier if it not admin', async () => {
        const testSupplier = await getTestSupplier()

        const result = await supertest(web)
            .get('/api/suppliers/' + testSupplier.id)
            .set('Authorization', `Bearer ${pramuniagaToken}`)

        logger.info(result.body)

        expect(result.status).toBe(403)
        expect(result.body.errors).toBeDefined()
    });

    it('should not be able to get supplier if there is no token', async () => {
        const testSupplier = await getTestSupplier()

        const result = await supertest(web)
            .get('/api/suppliers/' + testSupplier.id)

        logger.info(result.body)

        expect(result.status).toBe(401)
        expect(result.body.errors).toBeDefined()
    });

    it('should return 404 if supplier Id not found', async () => {
        const testSupplier = await getTestSupplier()

        const result = await supertest(web)
            .get('/api/suppliers/' + (testSupplier.id + 100))
            .set('Authorization', `Bearer ${token}`)

        logger.info(result.body)

        expect(result.status).toBe(404)
        expect(result.body.errors).toBeDefined()
    });
})

describe('DELETE /api/suppliers/:id', () => {

    beforeEach(async () => {
        await createTestUser()
        await createTestPramuniaga()
        token = await getTestToken()
        pramuniagaToken = await getPramuniagaToken()
    })

    afterEach(async () => {
        await removeAllTestUser()
    })

    beforeEach(async () => {
        await createTestSupplier()
    })

    afterEach(async () => {
        await removeAllTestSupplier()
    })

    it('should be able to delete supplier', async () => {
        const testSupplier = await getTestSupplier()

        const result = await supertest(web)
            .delete('/api/suppliers/' + testSupplier.id)
            .set('Authorization', `Bearer ${token}`)

        logger.info(result.body)

        expect(result.status).toBe(200)
        expect(result.body.data).toBeTruthy()
    })

    it('should not be able to delete supplier if not admin', async () => {
        const testSupplier = await getTestSupplier()

        const result = await supertest(web)
            .delete('/api/suppliers/' + testSupplier.id)
            .set('Authorization', `Bearer ${pramuniagaToken}`)

        logger.info(result.body)

        expect(result.status).toBe(403)
        expect(result.body.errors).toBeDefined()
    })

    it('should not be able to delete supplier if there is no token', async () => {
        const testSupplier = await getTestSupplier()

        const result = await supertest(web)
            .delete('/api/suppliers/' + testSupplier.id)

        logger.info(result.body)

        expect(result.status).toBe(401)
        expect(result.body.errors).toBeDefined()
    })

    it('should not be able to delete if not found', async () => {
        const testSupplier = await getTestSupplier()

        const result = await supertest(web)
            .delete('/api/suppliers/' + (testSupplier.id + 100))
            .set('Authorization', `Bearer ${token}`)

        logger.info(result.body)

        expect(result.status).toBe(404)
        expect(result.body.errors).toBeDefined()
    })
})

describe('GET /api/suppliers', () => {

    beforeEach(async () => {
        await createTestUser()
        await createTestPramuniaga()
        token = await getTestToken()
        pramuniagaToken = await getPramuniagaToken()
        await createManyTestSupplier()
    })

    afterEach(async () => {
        await removeAllTestUser()
        await removeAllTestSupplier()
    })

    it('should be able to search without parameters', async () => {
        const result = await supertest(web)
            .get('/api/suppliers')
            .set('Authorization', `Bearer ${token}`)

        logger.info(result.body);

        expect(result.status).toBe(200)
        expect(result.body.data.length).toBe(10);
        expect(result.body.paging.page).toBe(1);
        expect(result.body.paging.total_page).toBe(2);
        expect(result.body.paging.total_item).toBe(14);
    });

    it('should be able to search page 2', async () => {
        const result = await supertest(web)
            .get('/api/suppliers')
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
            .get('/api/suppliers')
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

    /**
     * TODO
     * Menambahkan parameter lain di search
     */

})