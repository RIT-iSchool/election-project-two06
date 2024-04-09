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
    try {
        const res = await client.query('SELECT * FROM public."users" WHERE "email" = $1', [email]);
        return res.rows[0];
    } catch (err) {
        console.error(err.message);
        throw err;
    }
}

module.exports = { getUserByEmail };