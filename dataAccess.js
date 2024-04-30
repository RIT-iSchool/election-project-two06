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
async function getSocietyDetailsByUserId(userId) {
    try {
        const query = `
            SELECT ps."societyid", ps."societyname"
            FROM public."professional_society" ps
            JOIN public."user_society" us ON us."societyid" = ps."societyid"
            WHERE us."userid" = $1;
        `;
        const result = await client.query(query, [userId]);
        return result.rows;
    } catch (error) {
        console.error("Error retrieving society name:", error);
        throw error;
    }
}
async function getBallotInitBySocietyId(societyId) {
    try {
        const query = `
            SELECT bi."description", bi."creationdate"
            FROM public."ballot_initiative" bi
            WHERE bi."societyid" = $1;
        `;
        const result = await client.query(query, [societyId]);
        return result.rows;
    } catch (error) {
        console.error("Error retrieving society name:", error);
        throw error;
    }
}
async function getSocietiesForAdmin(userId) {
    try {
        const query = `SELECT "usertype" FROM public."users" WHERE "userid" = $1;`;
        const userResult = await client.query(query, [userId]);
        const userType = userResult.rows[0].usertype;
        if (userType == 'admin') {
            // If the user is an admin, proceed with the query to get society names
            const societiesQuery = `SELECT societyname FROM professional_society;`;
            const societiesResult = await client.query(societiesQuery);
            // Extract the society names from the result
            const societyNames = societiesResult.rows.map(row => row.societyname);
            // Return the array of society names
            return societyNames;
        } else {
            // If the user is not an admin, return an empty array
            return [];
        }
        
    } catch (error) {
        console.error("Error retrieving societies:", error);
        throw error;
    }
}
async function getUsersForAdmin(userID) {
    try {
        const query = `SELECT "usertype" FROM public."users" WHERE "userid" = $1;`;
        const userResult = await client.query(query, [userID]);
        // Check if userResult.rows[0] is defined before accessing its properties
        if (userResult.rows[0] && userResult.rows[0].usertype) {
            const userType = userResult.rows[0].usertype;
            if (userType == 'admin') {
                // If the user is an admin, proceed with the query to get users
                const usersQuery = `SELECT "userid", "fname", "lname", "email", "usertype", "password" FROM public."users";`;
                const usersResult = await client.query(usersQuery);
                // Extract the society names from the result
                const userDetails = usersResult.rows;
                // Return the array of users
                return userDetails;
            }
        }
        // If the user is not an admin, return an empty array
        return [];
    } catch (error) {
        console.error("Error retrieving user details:", error);
        throw error;
    }
}

async function getBallotDetailsBySocId(socId) {
    try {
        const query = `
            SELECT b."ballotid", b."ballottitle"
            FROM public."ballot" b
            WHERE b."societyid" = $1
            AND CURRENT_DATE BETWEEN b."startdate" AND b."enddate";
        `;
        const result = await client.query(query, [socId]);
        return result.rows.map(row =>  ({ballotId: row.ballotid, ballotName: row.ballottitle}) )
    } catch (error) {
        console.error("Error retrieving ballot details:", error);
        throw error;
    }

}

async function getSocietyOfficesBySocId(socId) {
    try {
        const query = `
            SELECT o."officename"
            FROM public."office" o
            JOIN public."ballot" b ON o."ballotid" = b."ballotid"
            WHERE b."societyid" = $1
            AND CURRENT_DATE BETWEEN b."startdate" AND b."enddate";
        `;
        const result = await client.query(query, [socId]);
        return result.rows.map(row => row.officename);
    } catch (error) {
        console.error("Error retrieving society offices:", error);
        throw error;
    }
}


async function getCandidatesForOffice(socId, officeName) {
    try {
        const query = `
            SELECT CONCAT(c."cfname", ' ', c."clname") AS cname, c.photo
            FROM public."candidate" c
            JOIN public."office" o ON c."officeid" = o."officeid"
            JOIN public."ballot" b ON o."ballotid" = b."ballotid"
            WHERE b."societyid" = $1
            AND o."officename" = $2
        `;
        const result = await client.query(query, [socId, officeName]);
        return result.rows.map(row => ({ name: row.cname, photo: row.photo })); // Include both name and photo
    } catch (error) {
        console.error("Error retrieving candidates for office:", error);
        throw error;
    }
}

async function updateUser(userId, updatedDetails) {
    try {
        const updateQuery = `
            UPDATE public.users 
            SET fname = $1, lname = $2, email = $3, usertype = $4
            WHERE userid = $5
        `;
        const values = [updatedDetails.fname, updatedDetails.lname, updatedDetails.email, updatedDetails.usertype, userId];
        await client.query(updateQuery, values);
        console.log('User details updated successfully');
    } catch (error) {
        console.error('Error updating user details:', error);
        throw error;
    }
}
async function getUserDetailsByUserId(userId) {
    try {
        const selectUser = `
            SELECT "fname", "lname", "email", "usertype" FROM public."users" WHERE "userid" = $1;
        `;
        const result = await client.query(selectUser, [userId]);
        return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
        console.error('Error updating user details:', error);
        throw error;
    }
}

async function getSocietyDetailsBySocietyName(societyName) {
    try {
        const query = `
            SELECT "societyid" as "societyid", "societyname" as "societyname"
            FROM public."professional_society"
            WHERE "societyname" = $1;
        `;
        const result = await client.query(query, [societyName]);
        return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
        console.error("Error retrieving society details by name:", error);
        throw error;
    }
}

async function getElectionsBySocietyId(societyId) {
    try {
        const query = `
        SELECT "ballotid" as "electionid", "ballottitle" as "title", 
            "startdate" as "startDate", "enddate" as "endDate"
                FROM public."ballot"
                    WHERE "societyid" =  $1;
        `;
        const result = await client.query(query, [societyId]);
        return result.rows;
    } catch (error) {
        console.error("Error retrieving elections by society ID:", error);
        throw error;
    }
}

async function createUser(userDetails) {
    try {
        const userQuery = `
            INSERT INTO public.users (fname, lname, email, usertype, password)
            VALUES ($1, $2, $3, $4, $5);
        `;
        const userValues = [userDetails.fname, userDetails.lname, userDetails.email, userDetails.usertype, userDetails.password];
        await client.query(userQuery, userValues);
        const userId = await getUserByEmail(userDetails.email);
        const socId = await getSocietyDetailsBySocietyName(userDetails.society);
        const userSocQuery = `
            INSERT INTO public.user_society (userid, societyid)
            VALUES ($1, $2);
        `;
        const socValues = [userId.userid, socId.societyid];
        await client.query(userSocQuery, socValues);
        console.log('User created successfully');
    } catch (error) {
        console.error('Error updating user details:', error);
        throw error;
    }
}

module.exports = { connectToDatabase, 
    getSocietyDetailsBySocietyName,
    getElectionsBySocietyId,
    createUser, 
    getUserByEmail, 
    getBallotDetailsBySocId, 
    getUsersForAdmin, 
    getBallotInitBySocietyId, 
    getSocietyDetailsByUserId, 
    getSocietiesForAdmin, 
    getSocietyOfficesBySocId, 
    getCandidatesForOffice, 
    updateUser, 
    getUserDetailsByUserId };

