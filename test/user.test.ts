import {
    createTestPramuniaga,
    createTestUser,
    getPramuniagaToken,
    getTestToken, getTestUser,
    removeAllTestUser
} from "./utils/user-util";
import supertest from "supertest";
import {web} from "../src/application/web";
import {logger} from "../src/application/logging";
import {User} from "@prisma/client";

describe('POST /api/users', function () {
    let token: string;
    beforeEach(async () => {
        await createTestUser()
        token = await getTestToken()
    })

    afterEach(async () => {
        await removeAllTestUser()
    })

    it('should can create new user', async () => {
        const result = await supertest(web)
            .post('/api/users')
            .set('Authorization', `Bearer ${token}`)
            .send({
                username: 'test1',
                password: 'rahasia',
                name: 'test',
                role: 'SUPERADMIN'
            });

        logger.info(result.body);

        expect(result.status).toBe(201);
        expect(result.body.data.username).toBe("test1");
        expect(result.body.data.name).toBe("test");
        expect(result.body.data.role).toBe('SUPERADMIN');
        expect(result.body.data.password).toBeUndefined();
    });

    it('should can not create new user if role is invalid', async () => {
        const result = await supertest(web)
            .post('/api/users')
            .set('Authorization', `Bearer ${token}`)
            .send({
                username: 'test1',
                password: 'rahasia',
                name: 'test',
                role: 'APA'
            });

        logger.info(result.body);

        expect(result.status).toBe(400);
    });

    it('should reject if request is invalid', async () => {
        const result = await supertest(web)
            .post('/api/users')
            .set('Authorization', `Bearer ${token}`)
            .send({
                username: '',
                password: '',
                name: '',
                role: ''
            });

        logger.info(result.body);

        expect(result.status).toBe(400);
        expect(result.body.errors).toBeDefined();
    });

    it('should reject if username already registered', async () => {
        let result = await supertest(web)
            .post('/api/users')
            .set('Authorization', `Bearer ${token}`)
            .send({
                username: 'test1',
                password: 'rahasia',
                name: 'test',
                role: 'SUPERADMIN'
            });

        logger.info(result.body);

        expect(result.status).toBe(201);
        expect(result.body.data.username).toBe("test1");
        expect(result.body.data.name).toBe("test");
        expect(result.body.data.password).toBeUndefined();

        result = await supertest(web)
            .post('/api/users')
            .set('Authorization', `Bearer ${token}`)
            .send({
                username: 'test1',
                password: 'rahasia',
                name: 'test',
                role: 'SUPERADMIN'
            });

        logger.info(result.body);

        expect(result.status).toBe(400);
        expect(result.body.errors).toBeDefined();
    });

    it('should reject if token not found', async () => {
        const result = await supertest(web)
            .post('/api/users')
            .send({
                username: '',
                password: '',
                name: '',
                role: ''
            });

        logger.info(result.body);

        expect(result.status).toBe(401);
        expect(result.body.errors).toBeDefined();
    });

    it('should reject if token is invalid', async () => {
        const result = await supertest(web)
            .post('/api/users')
            .set('Authorization', `Bearer token`)
            .send({
                username: '',
                password: '',
                name: '',
                role: ''
            });

        logger.info(result.body);

        expect(result.status).toBe(401);
        expect(result.body.errors).toBeDefined();
    });

})

describe('POST /api/users/login', function () {
    beforeEach(async () => {
        await createTestUser()
    })

    afterEach(async () => {
        await removeAllTestUser()
    })

    it('should be able to login', async () => {
        const result = await supertest(web)
            .post('/api/users/login')
            .send({
                username: 'test',
                password: 'rahasia'
            });

        logger.info(result.body);

        expect(result.status).toBe(200);
        expect(result.body.data.token).toBeDefined();
    })

    it('should not be able to login if request is invalid', async () => {
        const result = await supertest(web)
            .post('/api/users/login')
            .send({
                username: '',
                password: ''
            });

        logger.info(result.body);

        expect(result.status).toBe(400);
        expect(result.body.errors).toBeDefined();
    });

    it('should be rejected if username is wrong', async () => {
        const result = await supertest(web)
            .post('/api/users/login')
            .send({
                username: 'test123',
                password: 'rahasia'
            });

        logger.info(result.body);

        expect(result.status).toBe(401);
        expect(result.body.errors).toBeDefined();
    });

    it('should be rejected if password is wrong', async () => {
        const result = await supertest(web)
            .post('/api/users/login')
            .send({
                username: 'test',
                password: 'rahasia123'
            });

        logger.info(result.body);

        expect(result.status).toBe(401);
        expect(result.body.errors).toBeDefined();
    });
})

describe('GET /api/users/current', function () {
    let token: string;
    let testUser: User;

    beforeEach(async () => {
        await createTestUser()
        token = await getTestToken()
        testUser = await getTestUser()
    })

    afterEach(async () => {
        await removeAllTestUser()
    })

    it('should be able to get current user', async () => {
        const result = await supertest(web)
            .get('/api/users/current')
            .set('Authorization', `Bearer ${token}`)

        logger.info(result.body);

        expect(result.status).toBe(200);
        expect(result.body.data.username).toBe(testUser.username);
        expect(result.body.data.name).toBe(testUser.name);
        expect(result.body.data.role).toBe(testUser.role);
    });

    it('should not be able to get current user if token is invalid', async () => {
        const result = await supertest(web)
            .get('/api/users/current')
            .set('Authorization', `Bearer token`)

        logger.info(result.body);

        expect(result.status).toBe(401);
        expect(result.body.errors).toBeDefined();
    });

    it('should not be able to get current user if there is no authorization header', async () => {
        const result = await supertest(web)
            .get('/api/users/current')

        logger.info(result.body);

        expect(result.status).toBe(401);
        expect(result.body.errors).toBeDefined();
    });
})

describe('GET /api/users', function () {
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

    it('should be able to search users without parameters', async () => {
        const result = await supertest(web)
            .get('/api/users')
            .set('Authorization', `Bearer ${token}`)

        logger.info(result.body)

        expect(result.status).toBe(200);
        expect(result.body.data.length).toBe(2)
        expect(result.body.paging.page).toBe(1);
        expect(result.body.paging.total_page).toBe(1);
        expect(result.body.paging.total_item).toBe(2);
    });

    it('should not be able to search users if it not admin', async () => {
        const result = await supertest(web)
            .get('/api/users')
            .set('Authorization', `Bearer ${cashierToken}`)

        logger.info(result.body);

        expect(result.status).toBe(403)
        expect(result.body.errors).toBeDefined();
    });

    it('should be able to search users with name', async () => {
        const result = await supertest(web)
            .get('/api/users')
            .set('Authorization', `Bearer ${token}`)
            .query({
                name: 'cashier'
            })

        logger.info(result.body)

        expect(result.status).toBe(200);
        expect(result.body.data.length).toBe(1);
        expect(result.body.paging.page).toBe(1);
        expect(result.body.paging.total_page).toBe(1);
        expect(result.body.paging.total_item).toBe(1);
    });

    it('should be able to search user with username', async () => {
        const result = await supertest(web)
            .get('/api/users')
            .set('Authorization', `Bearer ${token}`)
            .query({
                username: 'cashier'
            })

        logger.info(result.body)

        expect(result.status).toBe(200);
        expect(result.body.data.length).toBe(1);
        expect(result.body.paging.page).toBe(1);
        expect(result.body.paging.total_page).toBe(1);
        expect(result.body.paging.total_item).toBe(1);
    });

})