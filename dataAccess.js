const { Pool } = require('pg');

const pool = new Pool({
    host: "localhost",
    user: "postgres",
    port: 5432,
    password: "sass",
    database: "postgres"
});

async function getUserByEmail(email) {
    let client;
    try {
        client = await pool.connect();
        await client.query('BEGIN'); // Start transaction
        
        const res = await client.query('SELECT * FROM public."users" WHERE "email" = $1 FOR UPDATE', [email]);
        const user = res.rows[0];

        await client.query('COMMIT'); // Commit transaction
        return user;
    } catch (err) {
        if (client) await client.query('ROLLBACK'); // Rollback transaction if error
        console.error(err.message);
        throw err;
    } finally {
        if (client) client.release(); // Release the client back to the pool
    }
}

async function getUserRole(email) {
    let client;
    try {
        client = await pool.connect();
        await client.query('BEGIN'); // Start transaction
        
        const res = await client.query('SELECT "role" FROM public."users" WHERE "email" = $1', [email]);
        const role = res.rows[0].role;

        await client.query('COMMIT'); // Commit transaction
        return role;
    } catch (err) {
        if (client) await client.query('ROLLBACK'); // Rollback transaction if error
        console.error(err.message);
        throw err;
    } finally {
        if (client) client.release(); // Release the client back to the pool
    }
}

module.exports = { getUserByEmail, getUserRole };
