import request from 'supertest';
import app from '../backend/src/app.js';
import { User } from '../backend/src/models/User.js';
import { redisClient } from '../backend/src/config/redis.config.js';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

async function debug() {
    let mongoServer;
    try {
        mongoServer = await MongoMemoryServer.create();
        const mongoUri = mongoServer.getUri();
        await mongoose.connect(mongoUri);
        await User.ensureIndexes();

        const testUser = {
            email: 'integration@example.com',
            password: 'password123',
            firstName: 'Integration',
            lastName: 'Test',
            role: 'user'
        };

        console.log('--- REGISTER ATTEMPT ---');
        const regRes = await request(app).post('/api/auth/register').send(testUser);
        console.log('Status:', regRes.status);
        console.log('Body:', JSON.stringify(regRes.body, null, 2));

        console.log('--- LOGIN ATTEMPT ---');
        const loginRes = await request(app).post('/api/auth/login').send({
            email: testUser.email,
            password: testUser.password
        });
        console.log('Status:', loginRes.status);
        console.log('Body:', JSON.stringify(loginRes.body, null, 2));

    } catch (err) {
        console.error('DEBUG ERROR:', err);
    } finally {
        await mongoose.connection.close();
        if (mongoServer) await mongoServer.stop();
        await redisClient.quit();
        process.exit();
    }
}

debug();
