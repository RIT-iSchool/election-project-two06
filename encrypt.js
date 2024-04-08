const bcrypt = require('bcrypt');
const { Client } = require('pg');

async function encryptPasswords() {
    const client = new Client({
        host: "localhost",
        user: "postgres",
        port: 5432,
        password: "student", 
        database: "postgres" 
    });

    try {
        await client.connect();
        const res = await client.query('SELECT userid, password FROM public.users;');

        for (let row of res.rows) {
            const hashedPassword = await bcrypt.hash(row.password, 10); // The second parameter is the salt rounds
            await client.query('UPDATE public.users SET password = $1 WHERE userid = $2;', [hashedPassword, row.userid]);
        }

        console.log('All passwords were encrypted successfully!');
    } catch (err) {
        console.error('An error occurred during the encryption process:', err);
    } finally {
        await client.end();
    }
}

encryptPasswords();