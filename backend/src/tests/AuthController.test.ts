import request from 'supertest';
import app from '../app.js';
import { User } from '../models/User.js';
import { redisClient } from '../config/redis.config.js';

describe('AuthController Integration Tests', () => {
    const testUser = {
        email: 'integration@example.com',
        password: 'password123',
        firstName: 'Integration',
        lastName: 'Test',
        role: 'user'
    };

    beforeAll(async () => {
        // Ensure indexes are created for the User model (especially the unique email index)
        await User.ensureIndexes();
        // Clear test database before tests
        await User.deleteMany({});
    });

    afterEach(async () => {
        // Clear test database after each test to prevent cross-test contamination
        await User.deleteMany({});
    });

    afterAll(async () => {
        // Cleanup
        await redisClient.quit();
    });

    describe('POST /api/auth/register', () => {
        it('should register a new user successfully', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send(testUser);

            if (response.status !== 201) console.log('REGISTER ERROR:', response.body);
            expect(response.status).toBe(201);

            expect(response.body.success).toBe(true);
            expect(response.body.data.user).toHaveProperty('email', testUser.email);
            expect(response.body.data).toHaveProperty('token');
        });

        it('should return 400 if email already exists', async () => {
            await request(app)
                .post('/api/auth/register')
                .send(testUser);

            const response = await request(app)
                .post('/api/auth/register')
                .send(testUser)
                .expect(400); // Unique constraint violation should return 400

            expect(response.body.success).toBe(false);
        });
    });

    describe('POST /api/auth/login', () => {
        it('should login successfully with correct credentials', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: testUser.email,
                    password: testUser.password
                })
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty('token');
        });

        it('should fail with incorrect credentials', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: testUser.email,
                    password: 'wrongpassword'
                })
                .expect(401);

            expect(response.body.success).toBe(false);
        });
    });
});
