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
        await client.query('BEGIN'); // Begin the transaction
        const query = 'SELECT "userid", "password", "usertype" FROM public."users" WHERE "email" = $1';
        const result = await client.query(query, [email]);
        await client.query('COMMIT'); // Commit the transaction if all operations succeed
        return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
        await client.query('ROLLBACK'); // Rollback the transaction if any operation fails
        console.error("Error retrieving user:", error);
        throw error;
    }
}
async function getSocietyDetailsByUserId(userId) {
    try {
        await client.query('BEGIN'); // Begin the transaction
        const query = `
            SELECT ps."societyid", ps."societyname"
            FROM public."professional_society" ps
            JOIN public."user_society" us ON us."societyid" = ps."societyid"
            WHERE us."userid" = $1;
        `;
        const result = await client.query(query, [userId]);
        await client.query('COMMIT'); // Commit the transaction if all operations succeed
        return result.rows;
    } catch (error) {
        await client.query('ROLLBACK'); // Rollback the transaction if any operation fails
        console.error("Error retrieving society name:", error);
        throw error;
    }
}
async function getBallotInitBySocietyId(societyId, userId) {
    try {
        await client.query('BEGIN'); // Begin the transaction
        const query = `
            SELECT bi.description, bi.creationdate, bi.ballotinitid,
                   (SELECT TRUE FROM Ballot_Initiative_Vote biv
                    WHERE biv.BallotInitID = bi.ballotinitid AND biv.UserID = $2 AND biv.Choice = TRUE) AS voted
            FROM public.ballot_initiative bi
            WHERE bi.societyid = $1;
        `;
        const result = await client.query(query, [societyId, userId]);
        await client.query('COMMIT'); // Commit the transaction if all operations succeed
        return result.rows;
    } catch (error) {
        await client.query('ROLLBACK'); // Rollback the transaction if any operation fails
        console.error("Error retrieving society initiatives with vote status:", error);
        throw error;
    }
}

async function getBallotsPerSociety() {
    try {
        await client.query('BEGIN'); // Begin the transaction
        const query = `
            SELECT ps.societyname, COUNT(b.ballotid) AS total_ballots
            FROM professional_society ps
            LEFT JOIN ballot b ON ps.societyid = b.societyid
            GROUP BY ps.societyname;
        `;
        const result = await client.query(query);
        await client.query('COMMIT'); // Commit the transaction if all operations succeed
        return result.rows;
    } catch (error) {
        await client.query('ROLLBACK'); // Rollback the transaction if any operation fails
        console.error("Error retrieving ballots per society:", error);
        throw error;
    }
}

async function getMembersPerSociety() {
    try {
        await client.query('BEGIN'); // Begin the transaction
        const query = `
            SELECT ps.societyname, COUNT(us.userid) AS total_members
            FROM professional_society ps
            INNER JOIN user_society us ON ps.societyid = us.societyid
            WHERE us.userid IN (SELECT userid FROM users WHERE usertype = 'member')
            GROUP BY ps.societyname;
        `;
        const result = await client.query(query);
        await client.query('COMMIT'); // Commit the transaction if all operations succeed
        return result.rows;
    } catch (error) {
        await client.query('ROLLBACK'); // Rollback the transaction if any operation fails
        console.error("Error retrieving members per society:", error);
        throw error;
    }
}

async function getAverageMembersVotingPerElection() {
    try {
        await client.query('BEGIN'); // Begin the transaction
        const query = `
        WITH voted_members_counts AS (
            SELECT COUNT(DISTINCT v.userid) AS voted_members_count, v.ballotid
            FROM vote v
            INNER JOIN users u ON v.userid = u.userid AND u.usertype = 'member'
            GROUP BY v.ballotid
        )
        SELECT AVG(vmc.voted_members_count) AS average_members_voting
        FROM voted_members_counts vmc;
        
        
        `;
        const result = await client.query(query);
        await client.query('COMMIT'); // Commit the transaction if all operations succeed
        return result.rows[0].average_members_voting;
    } catch (error) {
        await client.query('ROLLBACK'); // Rollback the transaction if any operation fails
        console.error("Error retrieving average members voting per election:", error);
        throw error;
    }
}

async function getSocietiesForAdmin(userId) {
    try {
        await client.query('BEGIN'); // Begin the transaction
        const query = `SELECT "usertype" FROM public."users" WHERE "userid" = $1;`;
        const userResult = await client.query(query, [userId]);
        const userType = userResult.rows[0].usertype;
        if (userType == 'admin') {
            // If the user is an admin, proceed with the query to get society names
            const societiesQuery = `SELECT societyname FROM professional_society;`;
            const societiesResult = await client.query(societiesQuery);
            // Extract the society names from the result
            const societyNames = societiesResult.rows.map(row => row.societyname);
            await client.query('COMMIT'); // Commit the transaction if all operations succeed
            // Return the array of society names
            return societyNames;
        } else {
            // If the user is not an admin, return an empty array
            return [];
        }
        
    } catch (error) {
        await client.query('ROLLBACK'); // Rollback the transaction if any operation fails
        console.error("Error retrieving societies:", error);
        throw error;
    }
}
async function getUsersForAdmin(userID) {
    try {
        await client.query('BEGIN'); // Begin the transaction
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
                await client.query('COMMIT'); // Commit the transaction if all operations succeed
                return userDetails;
            }
        }
        // If the user is not an admin, return an empty array
        return [];
    } catch (error) {
        await client.query('ROLLBACK'); // Rollback the transaction if any operation fails
        console.error("Error retrieving user details:", error);
        throw error;
    }
}

async function getBallotDetailsByBallotId(ballotId) {
    try {
        await client.query('BEGIN'); // Begin the transaction
        const ballotDetails = [];
        const ballotQuery = `
            SELECT b."ballottitle", b."startdate", b."enddate"
            FROM public."ballot" b
            WHERE b."ballotid" = $1;
        `;
        const ballotResult = await client.query(ballotQuery, [ballotId]);
        const ballotRow = ballotResult.rows[0];
        // Structure ballot details
        const ballotObj = {
            ballottitle: ballotRow.ballottitle,
            startdate: ballotRow.startdate,
            enddate: ballotRow.enddate,
            offices: []
        };
        const officeQuery = `
            SELECT o."officeid", o."officename", o."choices"
            FROM public."office" o
            WHERE o."ballotid" = $1;
        `;
        const officeResult = await client.query(officeQuery, [ballotId]);
        // Loop through each office
        for (const officeRow of officeResult.rows) {
            const officeObj = {
                officeid: officeRow.officeid,
                officename: officeRow.officename,
                choices: officeRow.choices,
                candidates: []
            };

            const candidateQuery = `
                SELECT c."cfname", c."clname", c."photo"
                FROM public."candidate" c
                WHERE c."officeid" = $1;
            `;
            const candidateResult = await client.query(candidateQuery, [officeRow.officeid]);
            // Loop through each candidate for the current office
            for (const candidateRow of candidateResult.rows) {
                const candidateObj = {
                    cfname: candidateRow.cfname,
                    clname: candidateRow.clname,
                    photo: candidateRow.photo
                };
                // Add candidate object to the candidates array of the current office
                officeObj.candidates.push(candidateObj);
            }

            // Add office object to the offices array of the ballot
            ballotObj.offices.push(officeObj);
        }

        // Add ballot object to the ballotDetails array
        ballotDetails.push(ballotObj);
        console.log(ballotDetails);
        await client.query('COMMIT'); // Commit the transaction if all operations succeed
        return ballotDetails;
    } catch (error) {
        await client.query('ROLLBACK'); // Rollback the transaction if any operation fails
        console.error("Error retrieving ballot details:", error);
        throw error;
    }
}

async function getBallotDetailsBySocId(socId) {
    try {
        await client.query('BEGIN'); // Begin the transaction
        const query = `
            SELECT b."ballotid", b."ballottitle"
            FROM public."ballot" b
            WHERE b."societyid" = $1
            AND CURRENT_DATE BETWEEN b."startdate" AND b."enddate";
        `;
        const result = await client.query(query, [socId]);
        await client.query('COMMIT'); // Commit the transaction if all operations succeed
        return result.rows.map(row =>  ({ballotId: row.ballotid, ballotName: row.ballottitle}) )
    } catch (error) {
        await client.query('ROLLBACK'); // Rollback the transaction if any operation fails
        console.error("Error retrieving ballot details:", error);
        throw error;
    }
}

async function getSocietyOfficesBySocId(socId) {
    try {
        await client.query('BEGIN'); // Begin the transaction
        const query = `
            SELECT o."officename", o."officeid", o."choices"
            FROM public."office" o
            JOIN public."ballot" b ON o."ballotid" = b."ballotid"
            WHERE b."societyid" = $1
            AND CURRENT_DATE BETWEEN b."startdate" AND b."enddate";
        `;
        const result = await client.query(query, [socId]);
        await client.query('COMMIT'); // Commit the transaction if all operations succeed
        return result.rows.map(row => ({officeName: row.officename, officeId: row.officeid, officeChoice: row.choices}));
    } catch (error) {
        await client.query('ROLLBACK'); // Rollback the transaction if any operation fails
        console.error("Error retrieving society offices:", error);
        throw error;
    }
}

async function getCandidatesForOffice(socId, officeId) {
    try {
        await client.query('BEGIN'); // Begin the transaction
        const query = `
            SELECT CONCAT(c."cfname", ' ', c."clname") AS cname, c.photo, c."candidateid"
            FROM public."candidate" c
            JOIN public."office" o ON c."officeid" = o."officeid"
            JOIN public."ballot" b ON o."ballotid" = b."ballotid"
            WHERE b."societyid" = $1
            AND o."officeid" = $2
        `;
        const result = await client.query(query, [socId, officeId]);
        await client.query('COMMIT'); // Commit the transaction if all operations succeed
        return result.rows.map(row => ({ name: row.cname, photo: row.photo, candidateId: row.candidateid })); // Include both name and photo
    } catch (error) {
        await client.query('ROLLBACK'); // Rollback the transaction if any operation fails
        console.error("Error retrieving candidates for office:", error);
        throw error;
    }
}

async function updateUser(userId, updatedDetails) {
    try {
        await client.query('BEGIN'); // Begin the transaction
        const updateQuery = `
            UPDATE public.users 
            SET fname = $1, lname = $2, email = $3, usertype = $4
            WHERE userid = $5
        `;
        const values = [updatedDetails.fname, updatedDetails.lname, updatedDetails.email, updatedDetails.usertype, userId];
        await client.query(updateQuery, values);
        await client.query('COMMIT'); // Commit the transaction if all operations succeed
        console.log('User details updated successfully');
    } catch (error) {
        await client.query('ROLLBACK'); // Rollback the transaction if any operation fails
        console.error('Error updating user details:', error);
        throw error;
    }
}
async function getUserDetailsByUserId(userId) {
    try {
        await client.query('BEGIN'); // Begin the transaction
        const selectUser = `
            SELECT "fname", "lname", "email", "usertype" FROM public."users" WHERE "userid" = $1;
        `;
        const result = await client.query(selectUser, [userId]);
        await client.query('COMMIT'); // Commit the transaction if all operations succeed
        return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
        await client.query('ROLLBACK'); // Rollback the transaction if any operation fails
        console.error('Error updating user details:', error);
        throw error;
    }
}

async function getSocietyDetailsBySocietyName(societyName) {
    try {
        await client.query('BEGIN'); // Begin the transaction
        const query = `
            SELECT "societyid", "societyname"
            FROM public."professional_society"
            WHERE "societyname" = $1;
        `;
        const result = await client.query(query, [societyName]);
        await client.query('COMMIT'); // Commit the transaction if all operations succeed
        return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
        await client.query('ROLLBACK'); // Rollback the transaction if any operation fails
        console.error("Error retrieving society details by name:", error);
        throw error;
    }
}


async function getElectionsBySocietyId(societyId) {
    try {
        await client.query('BEGIN'); // Begin the transaction
        // Query for past elections
        const queryPast = `
            SELECT b."ballotid", b."ballottitle", b."startdate", b."enddate"
            FROM public."ballot" b
            WHERE "societyid" = $1 AND CURRENT_DATE > b."enddate";
        `;

        // Query for present elections
        const queryPresent = `
            SELECT b."ballotid", b."ballottitle", b."startdate", b."enddate"
            FROM public."ballot" b
            WHERE "societyid" = $1 AND CURRENT_DATE BETWEEN b."startdate" AND b."enddate";
        `;

        // Query for future elections
        const queryFuture = `
            SELECT b."ballotid", b."ballottitle", b."startdate", b."enddate"
            FROM public."ballot" b
            WHERE "societyid" = $1 AND CURRENT_DATE < b."startdate";
        `;

        const resultPast = await client.query(queryPast, [societyId]);
        const resultPresent = await client.query(queryPresent, [societyId]);
        const resultFuture = await client.query(queryFuture, [societyId]);
        await client.query('COMMIT'); // Commit the transaction if all operations succeed
        console.log(resultFuture.rows);
        return {
            pastElections: resultPast.rows,
            presentElections: resultPresent.rows,
            futureElections: resultFuture.rows
        };
    } catch (error) {
        await client.query('ROLLBACK'); // Rollback the transaction if any operation fails
        console.error("Error retrieving elections by society ID:", error);
        throw error;
    }
}

// Function to retrieve users who are members or officers from the Users table based on the selected election
async function getUsersByElection(societyName) {
    try {
        await client.query('BEGIN'); // Begin the transaction
        // Construct the SQL query to fetch users associated with the election
        const query = `
        SELECT u.userid, u.fname, u.lname, u.usertype
        FROM users u
        INNER JOIN user_society us ON u.userid = us.userid
        INNER JOIN professional_society ps ON us.societyid = ps.societyid
        WHERE ps.societyname = $1 AND (u.usertype = 'officer' OR u.usertype = 'member');
    `;
        // Execute the query and return the retrieved users
        const users = await client.query(query, [societyName]);
        await client.query('COMMIT'); // Commit the transaction if all operations succeed
        console.log("Retrieved Users:", users.rows);

        return users.rows;
    } catch (error) {
        await client.query('ROLLBACK'); // Rollback the transaction if any operation fails
        console.error("Error fetching users for election:", error);
        throw error;
    }
}

async function getVotedUsersByElection(societyName, electionName) {
    try {
        await client.query('BEGIN'); // Begin the transaction
        const socDetails = await getSocietyDetailsBySocietyName(societyName);
        // Construct the SQL query to fetch users who have voted in the election
        const query = `
        SELECT DISTINCT u.userid, u.fname, u.lname, u.usertype
        FROM users u
        INNER JOIN vote v ON u.userid = v.userid
        INNER JOIN ballot b ON v.ballotid = b.ballotid
        WHERE b.societyid = $1 AND b.ballottitle = $2;
    `;

        // Execute the query and return the retrieved voted users
        const votedUsers = await client.query(query, [socDetails.societyid, electionName]);
        await client.query('COMMIT'); // Commit the transaction if all operations succeed
        console.log("Retrieved Voted Users:", votedUsers.rows);

        return votedUsers.rows;
    } catch (error) {
        await client.query('ROLLBACK'); // Rollback the transaction if any operation fails
        console.error("Error fetching voted users for election:", error);
        throw error;
    }
}

async function createUser(userDetails) {
    try {
        await client.query('BEGIN'); // Begin the transaction
        const userQuery = `
            INSERT INTO public.users (fname, lname, email, usertype, password)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING userid;
        `;
        const userValues = [userDetails.fname, userDetails.lname, userDetails.email, userDetails.usertype, userDetails.password];
        const userResult = await client.query(userQuery, userValues);

        const userId = userResult.rows[0].userid;

        const socId = await getSocietyDetailsBySocietyName(userDetails.society);

        const userSocQuery = `
            INSERT INTO public.user_society (userid, societyid)
            VALUES ($1, $2);
        `;
        const socValues = [userId, socId.societyid];
        await client.query(userSocQuery, socValues);

        await client.query('COMMIT'); // Commit the transaction if all operations succeed
        console.log('User created successfully');
    } catch (error) {
        await client.query('ROLLBACK'); // Rollback the transaction if any operation fails
        console.error('Error creating user:', error);
        throw error; // Rethrow the error for the calling function to handle
    }
}

async function createVote(userId, ballotId, officeId, candidateId) {
    try {
        await client.query('BEGIN'); // Begin the transaction
        const insertQuery = `
            INSERT INTO public."vote" (userid, ballotid, officeid, candidateid, timestamp)
            VALUES ($1, $2, $3, $4, NOW());
        `;
        await client.query(insertQuery, [userId, ballotId, officeId, candidateId]);

        await client.query('COMMIT'); // Commit the transaction if all operations succeed
        console.log('Vote recorded successfully');
    } catch (error) {
        await client.query('ROLLBACK'); // Rollback the transaction if any operation fails
        console.error('Error recording vote:', error);
        throw error; // Rethrow the error for the calling function to handle
    }
}


async function createWriteInVote(userId, firstName, lastName, officeId) {
    try {
        await client.query('BEGIN'); // Begin the transaction

        const insertQuery = `
            INSERT INTO public.write_ins (userid, cfname, clname, officeid)
            VALUES ($1, $2, $3, $4);
        `;
        await client.query(insertQuery, [userId, firstName, lastName, officeId]);

        await client.query('COMMIT'); // Commit the transaction if all operations succeed
        console.log('Write-in vote recorded successfully');
    } catch (error) {
        await client.query('ROLLBACK'); // Rollback the transaction if any operation fails
        console.error('Error recording write-in vote:', error);
        throw error; // Rethrow the error for the calling function to handle
    }
}

async function saveBallotVote(ballotInitId, userId, choice, response) {
    try {
        await client.query('BEGIN'); // Begin the transaction

        const query = `
            INSERT INTO Ballot_Initiative_Vote (BallotInitID, UserID, Timestamp, Choice, Response)
            VALUES ($1, $2, NOW(), $3, $4);
        `;
        await client.query(query, [ballotInitId, userId, choice, response]);

        await client.query('COMMIT'); // Commit the transaction if all operations succeed
        console.log('Ballot initiative vote recorded successfully');
    } catch (error) {
        await client.query('ROLLBACK'); // Rollback the transaction if any operation fails
        console.error('Error recording ballot initiative votes:', error);
        throw error; // Rethrow the error for the calling function to handle
    }
}

module.exports = { connectToDatabase, 
    saveBallotVote,
    createVote,
    createWriteInVote,
    getSocietyDetailsBySocietyName,
    getElectionsBySocietyId,
    createUser, 
    getUserByEmail, 
    getBallotDetailsBySocId, 
    getUsersForAdmin, 
    getBallotsPerSociety,
    getBallotInitBySocietyId, 
    getSocietyDetailsByUserId, 
    getSocietiesForAdmin, 
    getSocietyOfficesBySocId, 
    getCandidatesForOffice, 
    updateUser, 
    getUserDetailsByUserId,
    getAverageMembersVotingPerElection,
    getMembersPerSociety,
    getVotedUsersByElection,
    getUsersByElection,
    getBallotDetailsByBallotId
};


