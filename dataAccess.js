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
        const result = await client.query('SELECT "userid", "password", "usertype" FROM public."users" WHERE "email" = $1', [email]);
        return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
        console.error("Error retrieving user:", error);
        throw error;
    }
}
async function getSocietyNameByUserId(userId) {
    try {
        const query = `
            SELECT ps."societyname"
            FROM public."user_society" us
            JOIN public."professional_society" ps ON us."societyid" = ps."societyid"
            WHERE us."userid" = $1;
        `;
        const result = await client.query(query, [userId]);
        return result.rows.length > 0 ? result.rows[0].societyname : null;
    } catch (error) {
        console.error("Error retrieving society name:", error);
        throw error;
    }
}

async function getSocietyOfficesByUserId(userId) {
    try {
        const query = `
            SELECT o."officename"
            FROM public."office" o
            JOIN public."ballot" b ON o."ballotid" = b."ballotid"
            JOIN public."professional_society" ps ON b."societyid" = ps."societyid"
            JOIN public."user_society" us ON ps."societyid" = us."societyid"
            WHERE us."userid" = $1
            AND CURRENT_DATE BETWEEN b."startdate" AND b."enddate";
        `;
        const result = await client.query(query, [userId]);
        return result.rows.map(row => row.officename);
    } catch (error) {
        console.error("Error retrieving society offices:", error);
        throw error;
    }
}


async function getCandidatesForOffice(userId, officeName) {
    try {
        const query = `
            SELECT CONCAT(c."cfname", ' ', c."clname") AS cname
            FROM public."candidate" c
            JOIN public."office" o ON c."officeid" = o."officeid"
            JOIN public."ballot" b ON o."ballotid" = b."ballotid"
            JOIN public."professional_society" ps ON b."societyid" = ps."societyid"
            JOIN public."user_society" us ON ps."societyid" = us."societyid"
            WHERE us."userid" = $1
            AND o."officename" = $2
        `;
        const result = await client.query(query, [userId, officeName]);
        return result.rows.map(row => row.candidate_name);
    } catch (error) {
        console.error("Error retrieving candidates for office:", error);
        throw error;
    }
}

module.exports = { connectToDatabase, getUserByEmail, getSocietyNameByUserId, getSocietyOfficesByUserId, getCandidatesForOffice };

