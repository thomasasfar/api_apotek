import {
    createTestPramuniaga,
    createTestUser,
    getPramuniagaToken,
    getTestToken,
    removeAllTestUser
} from "./utils/user-util";
import {createManyTestGroup, createTestGroup, getTestGroup, removeAllTestGroups} from "./utils/group-util";
import supertest from "supertest";
import {web} from "../src/application/web";
import {logger} from "../src/application/logging";
import {Group} from "@prisma/client";

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

describe('POST /api/groups', () => {
    afterEach(async () => {
        await removeAllTestGroups()
    })

    it('should be able to create groups', async () => {
        const result = await supertest(web)
            .post('/api/groups')
            .set('Authorization', `Bearer ${token}`)
            .send({
                name: 'test',
                description: 'test'
            })

        logger.info(result.body);

        expect(result.status).toBe(201);
        expect(result.body.data.name).toBe('test');
        expect(result.body.data.description).toBe('test');
    })

    it('should not be able to create groups if request is invalid', async () => {
        const result = await supertest(web)
            .post('/api/groups')
            .set('Authorization', `Bearer ${token}`)
            .send({
                name: '',
                description: ''
            })

        logger.info(result.body);

        expect(result.status).toBe(400);
        expect(result.body.errors).toBeDefined()
    })

    it('should not be able to create groups if groups with same name already exist', async () => {
        let result = await supertest(web)
            .post('/api/groups')
            .set('Authorization', `Bearer ${token}`)
            .send({
                name: 'test',
                description: 'test'
            })

        logger.info(result.body);

        expect(result.status).toBe(201);
        expect(result.body.data.name).toBe('test');
        expect(result.body.data.description).toBe('test');

        result = await supertest(web)
            .post('/api/groups')
            .set('Authorization', `Bearer ${token}`)
            .send({
                name: 'test',
                description: 'test'
            })

        logger.info(result.body);

        expect(result.status).toBe(400);
        expect(result.body.errors).toBeDefined()
    })

    it('should not be able to create groups if token not found', async () => {
        const result = await supertest(web)
            .post('/api/groups')
            .send({
                name: '',
                description: ''
            })

        logger.info(result.body);

        expect(result.status).toBe(401);
        expect(result.body.errors).toBeDefined()
    })

    it('should not be able to create groups if users is forbidden', async () => {
        const result = await supertest(web)
            .post('/api/groups')
            .set('Authorization', `Bearer ${cashierToken}`)
            .send({
                name: '',
                description: ''
            })

        logger.info(result.body);

        expect(result.status).toBe(403);
        expect(result.body.errors).toBeDefined()
    })
})

describe('GET /api/groups/:id', () => {
    let testGroup: Group;
    beforeEach(async () => {
        await createTestGroup()
        testGroup = await getTestGroup()
    })

    afterEach(async () => {
        await removeAllTestGroups()
    })

    it('should be able to get a group by id', async () => {
        const result = await supertest(web)
            .get('/api/groups/' + testGroup.id)
            .set('Authorization', `Bearer ${token}`)

        logger.info(result.body)

        expect(result.status).toBe(200)
        expect(result.body.data.name).toBe(testGroup.name)
        expect(result.body.data.description).toBe(testGroup.description)
    })

    it('should return 404 if id not found', async () => {
        const result = await supertest(web)
            .get('/api/groups/' + (testGroup.id + 100))
            .set('Authorization', `Bearer ${token}`)

        logger.info(result.body)

        expect(result.status).toBe(404)
        expect(result.body.errors).toBeDefined()
    })

    it('should not be able to get group if token not found', async () => {
        const result = await supertest(web)
            .get('/api/groups/' + testGroup.id)

        logger.info(result.body)

        expect(result.status).toBe(401)
        expect(result.body.errors).toBeDefined()
    })

    it('should not be able to get group if users is forbidden', async () => {
        const result = await supertest(web)
            .get('/api/groups/' + testGroup.id)
            .set('Authorization', `Bearer ${cashierToken}`)

        logger.info(result.body)

        expect(result.status).toBe(403)
        expect(result.body.errors).toBeDefined()
    })
});

describe('PUT /api/groups/:id', () => {
    let testGroup: Group;

    beforeEach(async () => {
        await createTestGroup()
        testGroup = await getTestGroup()
    })

    afterEach(async () => {
        await removeAllTestGroups()
    })

    it('should be able to update groups', async () => {
        const result = await supertest(web)
            .put('/api/groups/' + testGroup.id)
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

    it('should be able to update groups even description blank', async () => {
        const result = await supertest(web)
            .put('/api/groups/' + testGroup.id)
            .set('Authorization', `Bearer ${token}`)
            .send({
                name: 'test1',
                description: ''
            })

        logger.info(result.body)

        expect(result.status).toBe(200)
        expect(result.body.data.name).toBe('test1')
        expect(result.body.data.description).toBe('')
    });

    it('should be able to update groups even description field is not send', async () => {
        const result = await supertest(web)
            .put('/api/groups/' + testGroup.id)
            .set('Authorization', `Bearer ${token}`)
            .send({
                name: 'test1'
            })

        logger.info(result.body)

        expect(result.status).toBe(200)
        expect(result.body.data.name).toBe('test1')
        expect(result.body.data.description).toBe(testGroup.description)
    });

    it('should not be able to update groups if request is invalid', async () => {
        const result = await supertest(web)
            .put('/api/groups/' + testGroup.id)
            .set('Authorization', `Bearer ${token}`)
            .send({
                name: '',
                description: ''
            })

        logger.info(result.body)

        expect(result.status).toBe(400)
        expect(result.body.errors).toBeDefined()
    });

    it('should not be able to update groups if token not found', async () => {
        const result = await supertest(web)
            .put('/api/groups/' + testGroup.id)
            .send({
                name: '',
                description: ''
            })

        logger.info(result.body)

        expect(result.status).toBe(401)
        expect(result.body.errors).toBeDefined()
    });

    it('should not be able to update groups if users is forbidden', async () => {
        const result = await supertest(web)
            .put('/api/groups/' + testGroup.id)
            .set('Authorization', `Bearer ${cashierToken}`)
            .send({
                name: '',
                description: ''
            })

        logger.info(result.body)

        expect(result.status).toBe(403)
        expect(result.body.errors).toBeDefined()
    });
});

describe('DELETE /api/groups/:id', () => {
    let testGroup: Group;
    beforeEach(async () => {
        await createTestGroup()
        testGroup = await getTestGroup()
    })

    afterEach(async () => {
        await removeAllTestGroups()
    })

    it('should be able to delete groups', async () => {
        const result = await supertest(web)
            .delete('/api/groups/' + testGroup.id)
            .set('Authorization', `Bearer ${token}`)

        logger.info(result.body)

        expect(result.status).toBe(200)
        expect(result.body.data).toBeTruthy()
    });

    it('should not be able to delete groups if id not found', async () => {
        const result = await supertest(web)
            .delete('/api/groups/' + (testGroup.id + 100))
            .set('Authorization', `Bearer ${token}`)

        logger.info(result.body)

        expect(result.status).toBe(404)
        expect(result.body.errors).toBeDefined()
    });

    it('should not be able to delete groups if token not found', async () => {
        const result = await supertest(web)
            .delete('/api/groups/' + testGroup.id)

        logger.info(result.body)

        expect(result.status).toBe(401)
        expect(result.body.errors).toBeDefined()
    });

    it('should not be able to delete groups if users is forbidden', async () => {
        const result = await supertest(web)
            .delete('/api/groups/' + testGroup.id)
            .set('Authorization', `Bearer ${cashierToken}`)

        logger.info(result.body)

        expect(result.status).toBe(403)
        expect(result.body.errors).toBeDefined()
    });
});

describe('GET /api/groups', () => {
    beforeEach(async () => {
        await createManyTestGroup()
    })
    afterEach(async () => {
        await removeAllTestGroups()
    })

    it('should be able to search without parameters', async () => {
        const result = await supertest(web)
            .get('/api/groups')
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
            .get('/api/groups')
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
            .get('/api/groups')
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

    it('should be able to description with name parameters', async () => {
        const result = await supertest(web)
            .get('/api/groups')
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
            .get('/api/groups')
            .query({
                search: 'test 1'
            })

        logger.info(result.body);

        expect(result.status).toBe(401);
        expect(result.body.errors).toBeDefined()
    });

    it('should not be able to search if users is forbidden', async () => {
        const result = await supertest(web)
            .get('/api/groups')
            .set('Authorization', `Bearer ${cashierToken}`)
            .query({
                search: 'test 1'
            })

        logger.info(result.body);

        expect(result.status).toBe(403);
        expect(result.body.errors).toBeDefined()
    });
});