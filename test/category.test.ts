import {
    createTestUser,
    createTestPramuniaga,
    getTestToken,
    getPramuniagaToken,
    removeAllTestUser
} from "./utils/user-util";
import {
    createManyTestCategory,
    createTestCategory,
    getTestCategory,
    removeAllTestCategory
} from "./utils/category-util";
import supertest from "supertest";
import {web} from "../src/application/web";
import {logger} from "../src/application/logging";

let token: string;
let cashierToken: string;

beforeEach(async () => {
    await createTestUser()
    await createTestPramuniaga()
    token = await getTestToken();
    cashierToken = await getPramuniagaToken();
})

afterEach(async () => {
    await removeAllTestUser()
})

describe('POST /api/categories', () => {
    afterEach(async () => {
        await removeAllTestCategory();
    })

    it('should be able to post categories', async () => {
        const result = await supertest(web)
            .post('/api/categories')
            .set('Authorization', `Bearer ${token}`)
            .send({
                name: 'test',
                description: 'test',
            });

        logger.info(result.body)

        expect(result.status).toBe(201);
        expect(result.body.data.name).toBe('test');
        expect(result.body.data.description).toBe('test');
    })

    it('should not be able to post categories if request is invalid', async () => {
        const result = await supertest(web)
            .post('/api/categories')
            .set('Authorization', `Bearer ${token}`)
            .send({
                name: '',
                description: '',
            })

        logger.info(result.body)

        expect(result.status).toBe(400);
        expect(result.body.errors).toBeDefined()
    })

    it('should not be able to post categories if name already exist', async () => {
        let result = await supertest(web)
            .post('/api/categories')
            .set('Authorization', `Bearer ${token}`)
            .send({
                name: 'test',
                description: 'test',
            })

        logger.info(result.body)

        expect(result.status).toBe(201);
        expect(result.body.data.name).toBe('test');
        expect(result.body.data.description).toBe('test');

        result = await supertest(web)
            .post('/api/categories')
            .set('Authorization', `Bearer ${token}`)
            .send({
                name: 'test',
                description: 'test',
            })

        logger.info(result.body)

        expect(result.status).toBe(400);
        expect(result.body.errors).toBeDefined();
    })

    it('should not be able to post categories if category already exist', async () => {
        await createTestCategory()
        const result = await supertest(web)
            .post('/api/categories')
            .set('Authorization', `Bearer ${token}`)
            .send({
                name: 'test',
                description: 'test',
            })

        logger.info(result.body)

        expect(result.status).toBe(400);
        expect(result.body.errors).toBeDefined()
    })

    it('should not be able to post categories if there is no token', async () => {
        const result = await supertest(web)
            .post('/api/categories')
            .send({
                name: 'test',
                description: 'test',
            })

        logger.info(result.body)

        expect(result.status).toBe(401);
        expect(result.body.errors).toBeDefined()
    })

    it('should not be able to post categories if it not have access', async () => {
        const result = await supertest(web)
            .post('/api/categories')
            .set('Authorization', `Bearer ${cashierToken}`)
            .send({
                name: 'test',
                description: 'test',
            })

        logger.info(result.body)

        expect(result.status).toBe(403);
        expect(result.body.errors).toBeDefined()
    })
});

describe('GET /api/categories/:id', () => {
    beforeEach(async () => {
        await createTestCategory()
    })

    afterEach(async () => {
        await removeAllTestCategory()
    })

    it('should be able to get category', async () => {
        const testCategory = await getTestCategory()

        const result = await supertest(web)
            .get('/api/categories/' + testCategory.id)
            .set('Authorization', `Bearer ${token}`)

        logger.info(result.body)

        expect(result.status).toBe(200);
        expect(result.body.data.name).toBe(testCategory.name);
        expect(result.body.data.description).toBe(testCategory.description)
    });

    it('should return 404 if category not found', async () => {
        const testCategory = await getTestCategory()

        const result = await supertest(web)
            .get('/api/categories/' + (testCategory.id + 100))
            .set('Authorization', `Bearer ${token}`)

        logger.info(result.body)

        expect(result.status).toBe(404);
        expect(result.body.errors).toBeDefined()
    });

    it('should not be able to get category if there is no token', async () => {
        const testCategory = await getTestCategory()

        const result = await supertest(web)
            .get('/api/categories/' + testCategory.id)

        logger.info(result.body)

        expect(result.status).toBe(401);
        expect(result.body.errors).toBeDefined()
    });

    it('should not be able to get category if forbidden', async () => {
        const testCategory = await getTestCategory()

        const result = await supertest(web)
            .get('/api/categories/' + testCategory.id)
            .set('Authorization', `Bearer ${cashierToken}`)

        logger.info(result.body)

        expect(result.status).toBe(403);
        expect(result.body.errors).toBeDefined()
    });
});

describe('PUT /api/categories/:id', () => {
    beforeEach(async () => {
        await createTestCategory()
    })

    afterEach(async () => {
        await removeAllTestCategory()
    })

    it('should be able to update category', async () => {
        const testCategory = await getTestCategory()

        const result = await supertest(web)
            .put('/api/categories/' + testCategory.id)
            .set('Authorization', `Bearer ${token}`)
            .send({
                name: 'test1',
                description: 'test1'
            })

        logger.info(result.body)

        expect(result.status).toBe(200)
        expect(result.body.data.name).toBe('test1')
        expect(result.body.data.description).toBe('test1')
    });

    it('should not be able to update category if name that use to update already exist', async () => {
        const testCategory = await getTestCategory()

        let result = await supertest(web)
            .post('/api/categories')
            .set('Authorization', `Bearer ${token}`)
            .send({
                name: 'test1',
                description: 'test1',
            })

        logger.info(result.body)

        expect(result.status).toBe(201);
        expect(result.body.data.name).toBe('test1');
        expect(result.body.data.description).toBe('test1');

        result = await supertest(web)
            .put('/api/categories/' + testCategory.id)
            .set('Authorization', `Bearer ${token}`)
            .send({
                name: 'test1',
                description: 'test1'
            })

        logger.info(result.body)

        expect(result.status).toBe(400)
        expect(result.body.errors).toBeDefined()
    });

    it('should not be able to update category if category not found', async () => {
        const testCategory = await getTestCategory()

        const result = await supertest(web)
            .put('/api/categories/' + (testCategory.id + 100))
            .set('Authorization', `Bearer ${token}`)
            .send({
                name: 'test1',
                description: 'test1'
            })

        logger.info(result.body)

        expect(result.status).toBe(404)
        expect(result.body.errors).toBeDefined()
    });

    it('should not be able to update category if request is invalid', async () => {
        const testCategory = await getTestCategory()

        const result = await supertest(web)
            .put('/api/categories/' + testCategory.id)
            .set('Authorization', `Bearer ${token}`)
            .send({
                name: '',
                description: ''
            })

        logger.info(result.body)

        expect(result.status).toBe(400)
        expect(result.body.errors).toBeDefined()
    });

    it('should not be able to update category if there is no token', async () => {
        const testCategory = await getTestCategory()

        const result = await supertest(web)
            .put('/api/categories/' + testCategory.id)
            .send({
                name: 'test1',
                description: 'test1'
            })

        logger.info(result.body)

        expect(result.status).toBe(401)
        expect(result.body.errors).toBeDefined()
    });

    it('should not be able to update category if user is forbidden', async () => {
        const testCategory = await getTestCategory()

        const result = await supertest(web)
            .put('/api/categories/' + testCategory.id)
            .set('Authorization', `Bearer ${cashierToken}`)
            .send({
                name: 'test1',
                description: 'test1'
            })

        logger.info(result.body)

        expect(result.status).toBe(403)
        expect(result.body.errors).toBeDefined()
    });
});

describe('DELETE /api/categories/:id', () => {
    beforeEach(async () => {
        await createTestCategory()
    })

    afterEach(async () => {
        await removeAllTestCategory()
    })

    it('should be able to delete category', async () => {
        const testCategory = await getTestCategory()

        const result = await supertest(web)
            .delete('/api/categories/' + testCategory.id)
            .set('Authorization', `Bearer ${token}`)

        logger.info(result.body)

        expect(result.status).toBe(200)
        expect(result.body.data).toBeTruthy()
    });

    it('should not be able to delete category if category id not found', async () => {
        const testCategory = await getTestCategory()

        const result = await supertest(web)
            .delete('/api/categories/' + (testCategory.id + 100))
            .set('Authorization', `Bearer ${token}`)

        logger.info(result.body)

        expect(result.status).toBe(404)
        expect(result.body.errors).toBeDefined()
    });

    it('should not be able to delete category if token not found', async () => {
        const testCategory = await getTestCategory()

        const result = await supertest(web)
            .delete('/api/categories/' + (testCategory.id + 100))

        logger.info(result.body)

        expect(result.status).toBe(401)
        expect(result.body.errors).toBeDefined()
    });

    it('should not be able to delete category if user is forbidden', async () => {
        const testCategory = await getTestCategory()

        const result = await supertest(web)
            .delete('/api/categories/' + (testCategory.id + 100))
            .set('Authorization', `Bearer ${cashierToken}`)

        logger.info(result.body)

        expect(result.status).toBe(403)
        expect(result.body.errors).toBeDefined()
    });

});

describe('GET /api/categories', () => {
    beforeEach(async () => {
        await createManyTestCategory()
    })

    afterEach(async () => {
        await removeAllTestCategory()
    })

    it('should be able to search without parameters', async () => {
        const result = await supertest(web)
            .get('/api/categories')
            .set('Authorization', `Bearer ${token}`)

        logger.info(result.body)

        expect(result.status).toBe(200)
        expect(result.body.data.length).toBe(10);
        expect(result.body.paging.page).toBe(1);
        expect(result.body.paging.total_page).toBe(2);
        expect(result.body.paging.total_item).toBe(15);
    });

    it('should be able to search page 2', async () => {
        const result = await supertest(web)
            .get('/api/categories')
            .set('Authorization', `Bearer ${token}`)
            .query({
                page: 2
            })

        logger.info(result.body);

        expect(result.status).toBe(200);
        expect(result.body.data.length).toBe(5);
        expect(result.body.paging.page).toBe(2);
        expect(result.body.paging.total_page).toBe(2);
        expect(result.body.paging.total_item).toBe(15);
    });

    it('should be able to search with name parameters', async () => {
        const result = await supertest(web)
            .get('/api/categories')
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

    it('should be able to search with description parameters', async () => {
        const result = await supertest(web)
            .get('/api/categories')
            .set('Authorization', `Bearer ${token}`)
            .query({
                description: 'test 1'
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
            .get('/api/categories')
            .query({
                search: 'test 1'
            })

        logger.info(result.body);

        expect(result.status).toBe(401);
        expect(result.body.errors).toBeDefined()
    });

    it('should not be able to search if users is forbidden', async () => {
        const result = await supertest(web)
            .get('/api/categories')
            .set('Authorization', `Bearer ${cashierToken}`)
            .query({
                search: 'test 1'
            })

        logger.info(result.body);

        expect(result.status).toBe(403);
        expect(result.body.errors).toBeDefined()
    });
});