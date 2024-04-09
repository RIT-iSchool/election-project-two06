const { Client } = require('pg');

const client = new Client({
    host: "localhost",
    user: "postgres",
    port: 5432,
    password: "sass",
    database: "postgres"
});
client.connect();

async function getUserByEmail(email) {
    let client;
    try {
        client = await Pool.connect();
        await client.query('BEGIN');
        const res = await client.query('SELECT * FROM public."users" WHERE "email" = $1 FOR UPDATE', [email]);
        const user = res.rows[0];

        await client.query('COMMIT');
        return user;
    } catch (err) {
        if (client) await client.query('ROLLBACK');
        console.error(err.message);
        throw err;
    } finally {
        if (client) client.release();
    }
}

module.exports = { getUserByEmail };