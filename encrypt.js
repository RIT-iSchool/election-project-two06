const bcrypt = require('bcrypt');
const { Client } = require('pg');

async function encryptPasswords() {
    const client = new Client({
        host: "localhost",
        user: "postgres",
        port: 5432,
        password: "sass", 
        database: "postgres" 
    });

    try {
        await client.connect();
        const res = await client.query('SELECT userid, password, is_pwd_encrypted FROM public.users WHERE is_pwd_encrypted = false;');

        for (let row of res.rows) {
            const hashedPassword = await bcrypt.hash(row.password, 10); // The second parameter is the salt rounds
            // Update the password and set is_pwd_encrypted to true
            await client.query('UPDATE public.users SET password = $1, is_pwd_encrypted = true WHERE userid = $2;', [hashedPassword, row.userid]);
        }

        console.log('All passwords were encrypted successfully!');
    } catch (err) {
        console.error('An error occurred during the encryption process:', err);
    } finally {
        await client.end();
    }
}

module.exports = { encryptPasswords };