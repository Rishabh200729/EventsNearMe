import AuthService from '../services/AuthService.js';
import UserRepository from '../repositories/UserRepository.js';
import { redisClient } from '../config/redis.config.js';

// Mock the dependencies
jest.mock('../repositories/UserRepository.js');
jest.mock('../config/redis.config.js', () => ({
    redisClient: {
        setex: jest.fn().mockResolvedValue('OK'),
        get: jest.fn(),
    }
}));
jest.mock('../config/logger.js', () => ({
    logger: {
        info: jest.fn(),
        error: jest.fn(),
    }
}));

describe('AuthService Unit Tests', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('register', () => {
        it('should register a new user successfully', async () => {
            const userData = {
                email: 'test@example.com',
                password: 'password123',
                firstName: 'John',
                lastName: 'Doe'
            };

            const mockUser = {
                _id: 'user123',
                ...userData,
                role: 'user',
                save: jest.fn().mockResolvedValue({ _id: 'user123', ...userData, role: 'user' })
            };

            (UserRepository.findByEmail as jest.Mock).mockResolvedValue(null);
            (UserRepository.create as jest.Mock).mockResolvedValue(mockUser);

            const result = await AuthService.register(userData);

            expect(UserRepository.findByEmail).toHaveBeenCalledWith(userData.email);
            expect(UserRepository.create).toHaveBeenCalled();
            expect(result).toHaveProperty('user');
            expect(result).toHaveProperty('token');
            expect(result.user.email).toBe(userData.email);
        });

        it('should throw an error if user already exists', async () => {
            const userData = {
                email: 'existing@example.com',
                password: 'password123',
                firstName: 'John',
                lastName: 'Doe'
            };

            (UserRepository.findByEmail as jest.Mock).mockResolvedValue({ email: userData.email });

            await expect(AuthService.register(userData)).rejects.toThrow('User already exists with this email');
            expect(UserRepository.create).not.toHaveBeenCalled();
        });
    });

    describe('login', () => {
        it('should login a user with valid credentials', async () => {
            const email = 'test@example.com';
            const password = 'password123';

            const mockUser = {
                _id: 'user123',
                email,
                comparePassword: jest.fn().mockResolvedValue(true)
            };

            (UserRepository.findByEmail as jest.Mock).mockResolvedValue(mockUser);

            const result = await AuthService.login(email, password);

            expect(UserRepository.findByEmail).toHaveBeenCalledWith(email);
            expect(mockUser.comparePassword).toHaveBeenCalledWith(password);
            expect(result).toHaveProperty('user');
            expect(result).toHaveProperty('token');
        });

        it('should throw an error with invalid credentials', async () => {
            const email = 'test@example.com';
            const password = 'wrongpassword';

            (UserRepository.findByEmail as jest.Mock).mockResolvedValue(null);

            await expect(AuthService.login(email, password)).rejects.toThrow('Invalid credentials');
        });
    });
});
