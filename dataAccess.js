const { Client } = require('pg');

const client = new Client({
    host: "localhost",
    user: "postgres",
    port: 5432,
    password: "sass",
    database: "postgres"
});

async function connectToDatabase() {
    try {
        await client.connect();
        console.log("Connected to the database");
    } catch (error) {
        console.error("Error connecting to the database:", error);
    }
}

async function getUserByEmail(email) {
    try {
        const result = await client.query('SELECT "password", "usertype" FROM public."users" WHERE "email" = $1', [email]);
        return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
        console.error("Error retrieving user:", error);
        throw error;
    }
}

module.exports = { connectToDatabase, getUserByEmail };

