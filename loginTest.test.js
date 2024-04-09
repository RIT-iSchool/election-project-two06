const request = require('supertest');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const { app } = require('./newlogintest');
const { getUserByEmail } = require('./dataAccess');
const { verifyUser } = require('./businessLogic');

jest.mock('pg', () => { 
    const mPool = {
        connect: jest.fn().mockResolvedValue({
            query: jest.fn().mockResolvedValue({ rows: [{ id: 1, email: 'user@example.com', password: 'hashedpassword' }] }),
            release: jest.fn(),
        }),
    };
    return { Pool: jest.fn(() => mPool) };
});

jest.mock('./dataAccess', () => ({
    getUserByEmail: jest.fn(),
}));

jest.mock('bcrypt', () => ({
    compare: jest.fn(),
}));

// Data Access Layer Tests
describe('Data Access Layer', () => {
    let pool;
    beforeEach(() => {
        pool = new Pool();
    });

    test('getUserByEmail returns user when found', async () => {
        const user = { id: 1, email: 'user@example.com', password: 'hashedpassword' };
        pool.connect().then(client => client.query.mockResolvedValue({ rows: [user] }));

        const result = await getUserByEmail('user@example.com');
        expect(result).toEqual(user);
    });

    test('getUserByEmail returns undefined when user not found', async () => {
        pool.connect().then(client => client.query.mockResolvedValue({ rows: [] }));

        const result = await getUserByEmail('notfound@example.com');
        expect(result).toBeUndefined();
    });

    test('getUserByEmail throws error on database issue', async () => {
        pool.connect().then(client => client.query.mockRejectedValue(new Error('Database error')));

        await expect(getUserByEmail('error@example.com')).rejects.toThrow('Database error');
    });
});

// Business Logic Layer Tests
describe('Business Logic Layer', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('verifyUser returns true for valid credentials', async () => {
        getUserByEmail.mockResolvedValue({
            email: 'user@example.com',
            password: 'hashedpassword'
        });
        bcrypt.compare.mockResolvedValue(true);

        const result = await verifyUser('user@example.com', 'password');
        expect(result).toEqual({ valid: true, message: 'Valid credentials' });
    });

    test('verifyUser returns false for invalid credentials', async () => {
        getUserByEmail.mockResolvedValue({
            email: 'user@example.com',
            password: 'hashedpassword'
        });
        bcrypt.compare.mockResolvedValue(false);

        const result = await verifyUser('user@example.com', 'wrongpassword');
        expect(result).toEqual({ valid: false, message: 'Invalid credentials' });
    });

    test('verifyUser returns false when user not found', async () => {
        getUserByEmail.mockResolvedValue(undefined);

        const result = await verifyUser('notfound@example.com', 'password');
        expect(result).toEqual({ valid: false, message: 'User not found' });
    });
});

// Presentation Layer (Web Layer) Tests
describe('Presentation Layer', () => {
    test('serves the login page', async () => {
        const response = await request(app).get('/');
        expect(response.statusCode).toBe(200);
        expect(response.type).toBe('text/html');
    });

    test('handles login request with valid credentials', async () => {
        verifyUser.mockResolvedValue({ valid: true, message: 'Valid credentials' });
        const response = await request(app)
            .post('/')
            .send('email=user@example.com&password=password');
        
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({ message: 'Valid credentials' });
    });

    test('handles login request with invalid credentials', async () => {
        verifyUser.mockResolvedValue({ valid: false, message: 'Invalid credentials' });
        const response = await request(app)
            .post('/')
            .send('email=user@example.com&password=wrongpassword');
        
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({ message: 'Invalid credentials' });
    });

    test('handles internal server error', async () => {
        verifyUser.mockRejectedValue(new Error('Internal Server Error'));
        const response = await request(app)
            .post('/')
            .send('email=user@example.com&password=password');
        
        expect(response.statusCode).toBe(500);
        expect(response.body).toEqual({ error: 'Internal Server Error' });
    });
});

module.exports = { app }; 
