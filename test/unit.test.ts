import {
    createTestPramuniaga,
    createTestUser,
    getPramuniagaToken,
    getTestToken,
    removeAllTestUser
} from "./utils/user-util";
import {createManyTestUnit, createTestUnit, getTestUnit, removeAllTestUnits} from "./utils/unit-util";
import supertest from "supertest";
import {web} from "../src/application/web";
import {logger} from "../src/application/logging";
import {Unit} from "@prisma/client";

let token: string;
let cashierToken: string;

beforeEach(async () => {
    await createTestUser();
    await createTestPramuniaga()
    token = await getTestToken()
    cashierToken = await getPramuniagaToken()
})

afterEach(async () => {
    await removeAllTestUser()
})

describe("POST /api/units", () => {
    afterEach(async () => {
        await removeAllTestUnits()
    })

    it("should be able to create unit", async () => {
        const result = await supertest(web)
            .post('/api/units')
            .set('Authorization', `Bearer ${token}`)
            .send({
                name: 'test',
            })

        logger.info(result.body);

        expect(result.status).toBe(201);
        expect(result.body.data.name).toBe('test');
    })

    it('should not be able to create unit if request is invalid', async () => {
        const result = await supertest(web)
            .post('/api/units')
            .set('Authorization', `Bearer ${token}`)
            .send({
                name: '',
            })

        logger.info(result.body);

        expect(result.status).toBe(400);
        expect(result.body.errors).toBeDefined();
    });

    it('should not be able to create unit if unit with same name already exist', async () => {
        await createTestUnit()
        const result = await supertest(web)
            .post('/api/units')
            .set('Authorization', `Bearer ${token}`)
            .send({
                name: 'test',
            })

        logger.info(result.body);

        expect(result.status).toBe(400);
        expect(result.body.errors).toBeDefined();
    });

    it('should not be able to create unit if token not found', async () => {
        const result = await supertest(web)
            .post('/api/units')
            .send({
                name: 'test',
            })

        logger.info(result.body);

        expect(result.status).toBe(401);
        expect(result.body.errors).toBeDefined();
    });

    it('should not be able to create unit if users is forbidden', async () => {
        const result = await supertest(web)
            .post('/api/units')
            .set('Authorization', `Bearer ${cashierToken}`)
            .send({
                name: 'test',
            })

        logger.info(result.body);

        expect(result.status).toBe(403);
        expect(result.body.errors).toBeDefined();
    });
})

describe("GET /api/units/:id", () => {
    let testUnit: Unit;

    beforeEach(async () => {
        await createTestUnit()
        testUnit = await getTestUnit()
    })

    afterEach(async () => {
        await removeAllTestUnits()
    })

    it('should be able to get unit', async () => {
        const result = await supertest(web)
            .get('/api/units/' + testUnit.id)
            .set('Authorization', `Bearer ${token}`)

        logger.info(result.body)

        expect(result.status).toBe(200)
        expect(result.body.data.name).toBe(testUnit.name)
    });

    it('should return 404 if id not found', async () => {
        const result = await supertest(web)
            .get('/api/units/' + (testUnit.id + 100))
            .set('Authorization', `Bearer ${token}`)

        logger.info(result.body)

        expect(result.status).toBe(404)
        expect(result.body.errors).toBeDefined();
    });

    it('should not be able to get unit if token not found', async () => {
        const result = await supertest(web)
            .get('/api/units/' + testUnit.id)

        logger.info(result.body)

        expect(result.status).toBe(401)
        expect(result.body.errors).toBeDefined();
    });

    it('should not be able to get unit if users forbidden', async () => {
        const result = await supertest(web)
            .get('/api/units/' + testUnit.id)
            .set('Authorization', `Bearer ${cashierToken}`)

        logger.info(result.body)

        expect(result.status).toBe(403)
        expect(result.body.errors).toBeDefined();
    });
})

describe('PUT /api/units/:id', () => {
    let testUnit: Unit;
    beforeEach(async () => {
        await createTestUnit()
        testUnit = await getTestUnit()
    })

    afterEach(async () => {
        await removeAllTestUnits()
    })

    it('should be able to update unit', async () => {

        const result = await supertest(web)
            .put('/api/units/' + testUnit.id)
            .set('Authorization', `Bearer ${token}`)
            .send({
                name: 'test123'
            })

        logger.info(result.body);

        expect(result.status).toBe(200)
        expect(result.body.data.name).toBe('test123')
    });

    it('should not be able to update unit if name that use to update already exist', async () => {
        let result = await supertest(web)
            .post('/api/units/')
            .set('Authorization', `Bearer ${token}`)
            .send({
                name: 'test123'
            })

        expect(result.status).toBe(201)
        expect(result.body.data.name).toBe('test123')

        result = await supertest(web)
            .put('/api/units/' + testUnit.id)
            .set('Authorization', `Bearer ${token}`)
            .send({
                name: 'test123'
            })

        logger.info(result.body);

        expect(result.status).toBe(400)
        expect(result.body.errors).toBeDefined()
    });

    it('should not be able to update unit if request is invalid', async () => {

        const result = await supertest(web)
            .put('/api/units/' + testUnit.id)
            .set('Authorization', `Bearer ${token}`)
            .send({
                name: ''
            })

        logger.info(result.body);

        expect(result.status).toBe(400)
        expect(result.body.errors).toBeDefined()
    });

    it('should not be able to update unit if token not found', async () => {

        const result = await supertest(web)
            .put('/api/units/' + testUnit.id)
            .send({
                name: 'test123'
            })

        logger.info(result.body);

        expect(result.status).toBe(401)
        expect(result.body.errors).toBeDefined()
    });

    it('should not be able to update unit if users is forbidden', async () => {

        const result = await supertest(web)
            .put('/api/units/' + testUnit.id)
            .set('Authorization', `Bearer ${cashierToken}`)
            .send({
                name: 'test123'
            })

        logger.info(result.body);

        expect(result.status).toBe(403)
        expect(result.body.errors).toBeDefined()
    });
});

describe('DELETE /api/units/:id', () => {
    let testUnit: Unit;

    beforeEach(async () => {
        await createTestUnit()
        testUnit = await getTestUnit()
    })

    afterEach(async () => {
        await removeAllTestUnits()
    })

    it('should be able to delete unit', async () => {
        const result = await supertest(web)
            .delete('/api/units/' + testUnit.id)
            .set('Authorization', `Bearer ${token}`)

        logger.info(result.body)

        expect(result.status).toBe(200)
        expect(result.body.data).toBeTruthy()
    });

    it('should not be able to delete unit if id not found', async () => {
        const result = await supertest(web)
            .delete('/api/units/' + (testUnit.id + 100))
            .set('Authorization', `Bearer ${token}`)

        logger.info(result.body)

        expect(result.status).toBe(404)
        expect(result.body.errors).toBeDefined()
    });

    it('should not be able to delete unit if token not found', async () => {
        const result = await supertest(web)
            .delete('/api/units/' + testUnit.id)

        logger.info(result.body)

        expect(result.status).toBe(401)
        expect(result.body.errors).toBeDefined()
    });

    it('should not be able to delete unit if users is forbidden', async () => {
        const result = await supertest(web)
            .delete('/api/units/' + testUnit.id)
            .set('Authorization', `Bearer ${cashierToken}`)

        logger.info(result.body)

        expect(result.status).toBe(403)
        expect(result.body.errors).toBeDefined()
    });

});

describe('GET /api/units', () => {

    beforeEach(async () => {
        await createManyTestUnit()
    })

    afterEach(async () => {
        await removeAllTestUnits()
    })

    it('should be able to search without parameters', async () => {
        const result = await supertest(web)
            .get('/api/units')
            .set('Authorization', `Bearer ${token}`)

        logger.info(result.body)

        expect(result.status).toBe(200)
        expect(result.body.data.length).toBe(10)
        expect(result.body.paging.page).toBe(1);
        expect(result.body.paging.total_page).toBe(2);
        expect(result.body.paging.total_item).toBe(14);
    });

    it('should be able to search page 2', async () => {
        const result = await supertest(web)
            .get('/api/units')
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
            .get('/api/units')
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

    it('should not be able to search if token not found', async () => {
        const result = await supertest(web)
            .get('/api/units')
            .query({
                search: 'test 1'
            })

        logger.info(result.body);

        expect(result.status).toBe(401);
        expect(result.body.errors).toBeDefined()
    });

    it('should not be able to search if users is forbidden', async () => {
        const result = await supertest(web)
            .get('/api/units')
            .set('Authorization', `Bearer ${cashierToken}`)
            .query({
                search: 'test 1'
            })

        logger.info(result.body);

        expect(result.status).toBe(403);
        expect(result.body.errors).toBeDefined()
    });
});