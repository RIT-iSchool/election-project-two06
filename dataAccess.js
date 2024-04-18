// const { Pool } = require('pg');

// const pool = new Pool({
//     host: "localhost",
//     user: "postgres",
//     port: 5432,
//     password: "sass",
//     database: "postgres"
// });

// async function getUserByEmail(email) {
//     let client;
//     try {
//         client = await pool.connect();
//         await client.query('BEGIN'); // Start transaction
        
//         const res = await client.query('SELECT * FROM public."users" WHERE "email" = $1 FOR UPDATE', [email]);
//         const user = res.rows[0];

//         await client.query('COMMIT'); // Commit transaction
//         return user;
//     } catch (err) {
//         if (client) await client.query('ROLLBACK'); // Rollback transaction if error
//         console.error(err.message);
//         throw err;
//     } finally {
//         if (client) client.release(); // Release the client back to the pool
//     }
// }

// module.exports = { getUserByEmail };

// dataAccess.js
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

